import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { listAllFollowingsByVictim } from "/opt/nodejs/database/following";
import { Context, APIGatewayEvent } from 'aws-lambda';

const main: MainFunction = async (event, context, authenticatedUser) => {
    
    const appUsername = authenticatedUser.username
    const { key } = event.pathParameters;
    
    let [ createdTime, victimId ] = key.split('#')
    if (createdTime === undefined || victimId === undefined) {
        return {
            statusCode: 400,
            code: 'INVALID_ID',
            message: `Invalid id ${key}`
        }
    }
    victimId = victimId.replace('TWITTER_VICTIM@', '')

    const followings = await listAllFollowingsByVictim(appUsername, victimId);
    const response = {
        "allIds": [],
        "byId": {}
    }
    followings.forEach((item) => {
        const queryKey = item.toQueryKey().SK;
        response.allIds.push(queryKey);
        response.byId[queryKey] = item.toAPI();
    })
    return response
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context })
}
