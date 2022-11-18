import { response_wrapper } from "/opt/nodejs/response";
import { list_victims_by_app_username, put_entity, batch_update_following, get_user_by_username, update_user_track_count } from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { Victim } from "/opt/nodejs/entity";
import { get_twitter_user_by_screenname, get_all_following_api } from "/opt/nodejs/twitter-utils";

const MAX_VICTIMS = 50

const main = async (event: APIGatewayEvent, context: Context) => {
    // get api gateway body
    // const { id } = event.pathParameters;
    const app_username = 'tung'
    const user = await get_user_by_username(app_username)
    if (user.track_count >= MAX_VICTIMS) {
        return {
            statusCode: 400,
            code: 'MAX_VICTIMS_REACHED',
            message: 'Max number of trackers reached, please delete some trackers or upgrade your plan',
        }
    }

    const { id } = event.pathParameters;
    const response_victim = await get_twitter_user_by_screenname(id);
    if (!response_victim.data.user) {
        return {
            statusCode: 400,
            code: 'TWITTER_USER_NOT_FOUND',
            message: `Twitter user ${id} not found`
        }
    }
    const new_victim = Victim.fromTwitterAPI(app_username, response_victim.data.user.result);

    // check if victim already exists
    const victims = await list_victims_by_app_username(app_username);
    const existing_victim = victims.Items.find(v => v.victim_id === new_victim.victim_id);
    if (existing_victim) {
        return {
            statusCode: 400,
            code: 'VICTIM_ALREADY_EXISTS',
            message: `Tracker ${id} already exists`
        }
    }

    const following_count = await init_victim_following(app_username, new_victim.victim_id)
    new_victim.track_count = following_count
    await Promise.all([
        update_user_track_count(app_username, user.track_count + 1),
        put_entity(new_victim),
    ])

    return {
        code: 'SUCCESS',
        message: "Add tracker successfully",
    }
}

const init_victim_following = async (app_username: string, victim_id: string) => {
    const victim_following = await get_all_following_api(app_username, victim_id)
    await batch_update_following(victim_following, [])
    return victim_following.length
}


exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await response_wrapper({ main, event, context })
}
