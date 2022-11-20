import { MainFunction, response_wrapper } from "/opt/nodejs/response";
import { list_all_followings_by_victim } from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';

const main: MainFunction = async (event, context, authenticated_user) => {
    
    const app_username = authenticated_user.username
    const { id } = event.queryStringParameters;
    
    let [ created_time, victim_id ] = id.split('#')
    if (created_time === undefined || victim_id === undefined) {
        return {
            statusCode: 400,
            code: 'INVALID_ID',
            message: `Invalid id ${id}`
        }
    }
    victim_id = victim_id.replace('TWITTER_VICTIM@', '')

    const followings = await list_all_followings_by_victim(app_username, victim_id);
    const response = {
        "allIds": [],
        "byId": {}
    }
    followings.forEach((item) => {
        const query_key = item.toQueryKey().SK;
        response.allIds.push(query_key);
        response.byId[query_key] = item.toAPI();
    })
    return response
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await response_wrapper({ main, event, context })
}
