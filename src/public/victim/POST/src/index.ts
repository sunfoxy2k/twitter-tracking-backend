import { MainFunction, response_wrapper } from "/opt/nodejs/response";
import * as database from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { Victim } from "/opt/nodejs/entity";
import * as twitter_utils from "/opt/nodejs/twitter-utils";
import axios from "axios";

const MAX_VICTIMS = 50
const API_URL = 'https://o764uw297g.execute-api.eu-west-3.amazonaws.com/DEV'

const main: MainFunction = async (event, context, authenticated_user) => {

    // Get and validate app user
    const { id } = event.queryStringParameters;
    const [
        user,
        response_victim,
    ] = await Promise.all([
        database.get_user_by_username(authenticated_user.username),
        twitter_utils.get_twitter_user_by_screenname(id),
    ])

    // Check if user has reached max victims
    if (user.track_count >= MAX_VICTIMS) {
        return {
            statusCode: 400,
            code: 'MAX_VICTIMS_REACHED',
            message: 'Max number of trackers reached, please delete some trackers or upgrade your plan',
        }
    }

    // Check if victim exists
    if (!response_victim.data.user) {
        return {
            statusCode: 404,
            code: 'TWITTER_USER_NOT_FOUND',
            message: `Twitter user ${id} not found`
        }
    }
    const new_victim = Victim.fromTwitterAPI(user.app_username, response_victim.data.user.result);
    // check if victim already exists
    const victims = await database.list_victims_by_app_username(user.app_username);
    const existing_victim = victims.Items.find(v => v.victim_id === new_victim.victim_id);
    if (existing_victim) {
        return {
            statusCode: 400,
            code: 'VICTIM_ALREADY_EXISTS',
            message: `Tracker ${id} already exists`
        }
    }

    
    await Promise.all([
        database.variant_user_track_count(user.app_username, 1),
        database.put_entity(new_victim),
    ])
    await axios.post(`${API_URL}/private/victim`, {
        app_username: new_victim.app_username,
        victim_id: new_victim.victim_id,
        created_time: new_victim.created_time.valueOf(),
        victim_username: new_victim.victim_username,
    })

    return {
        code: 'SUCCESS',
        message: "Add tracker successfully, please wait a few minutes for the following to be updated",
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await response_wrapper({ main, event, context })
}
