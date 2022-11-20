import { MainFunction, response_wrapper } from "/opt/nodejs/response";
import { batch_update_following, update_victim_track_count } from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { get_all_following_api } from "/opt/nodejs/twitter-utils";
import { Victim } from "/opt/nodejs/entity";
const main: MainFunction = async (event) => {

    const {
        app_username,
        victim_id,
        created_time,
        victim_username,
    } = JSON.parse(event.body);

    const new_followings = await get_all_following_api(app_username, victim_id)
    const victim = new Victim({
        app_username,
        victim_id,
        created_time: new Date(Number(created_time)),
        track_count: new_followings.length,
        victim_username: victim_username,
    })

    await Promise.all([
        batch_update_following(new_followings, []),
        update_victim_track_count(victim, new_followings.length),
    ])

    return {
        code: 'SUCCESS',
        message: "Add followings successfully",
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await response_wrapper({ main, event, context, authentication: false })
}
