import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { batchUpdateFollowing } from "/opt/nodejs/database/following";
import { updateVictimTrackCount } from "/opt/nodejs/database/victim";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { getAllFollowingApi } from "/opt/nodejs/twitter-utils";
import { Victim } from "/opt/nodejs/entity/Victim";
const main: MainFunction = async (event) => {

    const {
        appUsername,
        victimId,
        createdTime,
        victimUsername,
    } = JSON.parse(event.body);

    const newFollowings = await getAllFollowingApi(appUsername, victimId)
    const victim = new Victim({
        appUsername,
        victimId,
        createdTime: new Date(Number(createdTime)),
        trackCount: newFollowings.length,
        victimUsername: victimUsername,
    })

    await Promise.all([
        batchUpdateFollowing(newFollowings, []),
        updateVictimTrackCount(victim, newFollowings.length),
    ])

    return {
        code: 'SUCCESS',
        message: "Add followings successfully",
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context, authentication: false })
}
