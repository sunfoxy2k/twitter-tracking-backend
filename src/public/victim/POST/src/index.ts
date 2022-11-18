import { response_wrapper } from "/opt/nodejs/response";
import { list_victims_by_app_username, put_entity } from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { Victim } from "/opt/nodejs/entity";
import { get_user_by_screenname } from "/opt/nodejs/twitter-utils";
const main = async (event: APIGatewayEvent, context: Context) => {
    // get api gateway body
    // const { id } = event.pathParameters;
    const user = 'tung'
    const { id } = event.pathParameters;
    const response_victim = await get_user_by_screenname(id);
    if (!response_victim) {
        return {
            statusCode: 400,
            code: 'TWITTER_USER_NOT_FOUND',
            message: `Twitter user ${id} not found`
        }
    }
    const victim = Victim.fromAPI(user, response_victim.data.user.result);
    await put_entity(victim);
    return {
        code: 'SUCCESS',
        message: 'Add victim successfully',
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await response_wrapper({ main, event, context })
}
