import { MainFunction, response_wrapper } from "/opt/nodejs/response";
import * as database from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';
import axios from "axios";

const API_URL = 'https://o764uw297g.execute-api.eu-west-3.amazonaws.com/DEV'

const main: MainFunction = async (event, context, authenticated_user) => {
    const app_username = authenticated_user.username

    const { id } = event.queryStringParameters
    let [
        created_time,
        victim_id,
    ] = id.split('#')
    if (created_time === undefined || victim_id === undefined) {
        return {
            statusCode: 400,
            code: 'INVALID_ID',
            message: `Invalid id ${id}`
        }
    }
    victim_id = victim_id.replace('TWITTER_VICTIM@', '')
    const victim = await database.get_item_with_key(`USER@${app_username}`, id)
    if (!victim) {
        return {
            statusCode: 404,
            code: 'VICTIM_NOT_FOUND',
            message: `Tracker ${id} not found`
        }
    }
    await Promise.all([
        database.delete_item_by_key(`USER@${app_username}`, id),
        database.variant_user_track_count(app_username, -1),
    ])

    await axios.delete(`${API_URL}/private/victim`, {
        data: {
            app_username,
            victim_id: id,
        }
    })

    return {
        code: 'SUCCESS',
        message: 'Delete Tracker Successfully',
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await response_wrapper({ main, event, context })
}
