import { MainFunction, response_wrapper } from "/opt/nodejs/response";
import { get_user_by_username } from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';

const main: MainFunction = async (event, context, authenticated_user) => {
    // get api gateway body
    const app_username = authenticated_user.username
    const user = await get_user_by_username(app_username)
    return user.toAPI()
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await response_wrapper({ main, event, context })
}
