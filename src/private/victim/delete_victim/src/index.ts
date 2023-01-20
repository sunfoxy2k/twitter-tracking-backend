import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import * as database from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';
const main: MainFunction = async (event) => {

    const {
        appUsername,
        victimId,
    } = JSON.parse(event.body);
    
    const deleteFollowings = await database.listAllFollowingsByVictim(appUsername, victimId);


    await Promise.all([
        database.batchUpdateFollowing([], deleteFollowings),
        database.variantUserTrackCount(appUsername, -1),
    ])
    return {
        code: 'SUCCESS',
        message: "Delete followings successfully",
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context, authentication: false })
}
