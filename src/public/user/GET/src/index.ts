import { response_wrapper } from "/opt/nodejs/response";
import { get_user_by_username } from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';

const main = async (event: APIGatewayEvent, context: Context) => {
    // get api gateway body
    const id = 'tung'
    const app_user = await get_user_by_username(id);
    return app_user.toAPI();
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await response_wrapper({ main, event, context })
}
