import { response_wrapper } from "/opt/nodejs/response";
import { list_all_followings_by_victim } from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';

const main = async (event: APIGatewayEvent, context: Context) => {
    // get api gateway body
    const { id } = event.pathParameters;
    const user = 'tung'
    let victim_id = id.split('#')
    if (victim_id.length !== 2) {
        return {
            statusCode: 400,
            code: 'INVALID_ID',
            message: `Invalid id ${id}`
        }
    }
    victim_id = victim_id[1].split('@')
    if (victim_id.length !== 2) {
        return {
            statusCode: 400,
            code: 'INVALID_ID',
            message: `Invalid id ${id}`
        }
    }
    let parse_victim_id = victim_id[1]

    const followings = await list_all_followings_by_victim(user, parse_victim_id);
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
