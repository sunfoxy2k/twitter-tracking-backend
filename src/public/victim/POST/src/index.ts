import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import * as database from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { Victim } from "/opt/nodejs/entity";
import * as twitter_utils from "/opt/nodejs/twitter-utils";
import axios from "axios";

const MAX_VICTIMS = 50
const API_URL = 'https://o764uw297g.execute-api.eu-west-3.amazonaws.com/DEV'

const main: MainFunction = async (event, context, authenticatedUser) => {

    // Get and validate app user
    const { id } = event.queryStringParameters;
    const [
        user,
        response_victim,
    ] = await Promise.all([
        database.getUserByUsername(authenticatedUser.username),
        twitter_utils.getTwitterUserByScreenname(id),
    ])

    // Check if user has reached max victims
    if (user.trackCount >= MAX_VICTIMS) {
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
    const new_victim = Victim.fromTwitterAPI(user.appEmail, response_victim.data.user.result);
    // check if victim already exists
    const victims = await database.listVictimsByAppEmail(user.appEmail);
    const existing_victim = victims.Items.find(v => v.victimId === new_victim.victimId);
    if (existing_victim) {
        return {
            statusCode: 400,
            code: 'VICTIM_ALREADY_EXISTS',
            message: `Tracker ${id} already exists`
        }
    }

    
    await Promise.all([
        database.variantUserTrackCount(user.appEmail, 1),
        database.putEntity(new_victim),
    ])
    await axios.post(`${API_URL}/private/victim`, {
        appEmail: new_victim.appEmail,
        victimId: new_victim.victimId,
        created_time: new_victim.createdTime.valueOf(),
        victimUsername: new_victim.victimUsername,
    })

    return {
        code: 'SUCCESS',
        message: "Add tracker successfully, please wait a few minutes for the following to be updated",
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context })
}
