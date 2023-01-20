import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { listAllFollowingsByVictim } from "/opt/nodejs/database/following";
import { batchUpdateFollowing } from "/opt/nodejs/database/following";
import { variantUserTrackCount } from "/opt/nodejs/database/user";
import { Context, APIGatewayEvent } from 'aws-lambda';
const main: MainFunction = async (event) => {

    const {
        appUsername,
        victimId,
    } = JSON.parse(event.body);
    
    const deleteFollowings = await listAllFollowingsByVictim(appUsername, victimId);


    await Promise.all([
        batchUpdateFollowing([], deleteFollowings),
        variantUserTrackCount(appUsername, -1),
    ])
    return {
        code: 'SUCCESS',
        message: "Delete followings successfully",
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context, authentication: false })
}
