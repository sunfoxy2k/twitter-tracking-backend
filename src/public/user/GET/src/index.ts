import { response_wrapper } from "/opt/nodejs/response";
import { verifyToken } from "/opt/nodejs/authentication";
import { get_user_by_username } from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';

const main = async (event: APIGatewayEvent, context: Context) => {
    // get api gateway body
    const jwt = event.headers.Authorization || event.headers.authorization;
    const app_user = verifyToken(jwt);
    if (!app_user) {
        return {
            statusCode: 401,
            code: 'UNAUTHORIZED',
            message: 'Unauthorized'
        }
    }
    return app_user
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await response_wrapper({ main, event, context })
}
