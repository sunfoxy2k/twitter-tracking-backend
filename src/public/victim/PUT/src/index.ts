import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { Victim } from "/opt/nodejs/entity/Victim";
import * as twitter_utils from "/opt/nodejs/twitter-utils";
import { getUserByUsername, variantUserTrackCount } from "/opt/nodejs/database/user";
import { listVictimsByAppUsername } from "/opt/nodejs/database/victim";
import { putEntity } from "/opt/nodejs/database/utils";
import { getAllFollowingApi } from '/opt/nodejs/twitter-utils';
import { batchUpdateFollowing } from '/opt/nodejs/database/following';
import { updateVictimTrackCount } from '/opt/nodejs/database/victim';

const MAX_VICTIMS = 50

const main: MainFunction = async (event, context, authenticatedUser) => {
    const appUsername = authenticatedUser.username

    // Get and validate app user
    const { id } = event.pathParameters;
    if (!id) {
        return {
            statusCode: 400,
            code: 'MISSING_PARAMETER',
            message: 'Missing parameter id',
        }
    }
    const [
        user,
        response_victim,
    ] = await Promise.all([
        getUserByUsername(authenticatedUser.username),
        twitter_utils.getTwitterUserByScreenname(id),
    ])

    // Check if user has reached max victims
    if (user.trackCount >= MAX_VICTIMS) {
        return {
            statusCode: 400,
            code: 'MAX_VICTIMS_REACHED',
            message: 'Max number of trackers reached, please delete some trackers or upgrade your plan',
        }
    }

    // Check if victim exists
    if (!response_victim.data.user) {
        return {
            statusCode: 404,
            code: 'TWITTER_USER_NOT_FOUND',
            message: `Twitter user ${id} not found`
        }
    }
    const newVictim = Victim.fromTwitterAPI(appUsername, response_victim.data.user.result);
    // check if victim already exists
    const victims = await listVictimsByAppUsername(appUsername);
    const existingVictim = victims.Items.find(v => v.victimId === newVictim.victimId);
    if (existingVictim) {
        return {
            statusCode: 400,
            code: 'VICTIM_ALREADY_EXISTS',
            message: `Tracker ${id} already exists`
        }
    }

    
    await Promise.all([
        variantUserTrackCount(user.appUsername, 1),
        putEntity(newVictim),
    ])

    const newFollowings = await getAllFollowingApi(appUsername, newVictim.victimId)

    await Promise.all([
        batchUpdateFollowing(newFollowings, []),
        updateVictimTrackCount(newVictim, newFollowings.length),
    ])

    return {
        code: 'SUCCESS',
        message: "Add tracker successfully, please wait a few minutes for the following to be updated",
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context })
}
