import { MainFunction, response_wrapper } from "/opt/nodejs/response";
import * as database from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';
const main: MainFunction = async (event) => {

    const {
        app_username,
        victim_id,
    } = JSON.parse(event.body);
    
    const delete_followings = await database.list_all_followings_by_victim(app_username, victim_id);


    await Promise.all([
        database.batch_update_following([], delete_followings),
        database.variant_user_track_count(app_username, -1),
    ])
    return {
        code: 'SUCCESS',
        message: "Delete followings successfully",
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await response_wrapper({ main, event, context, authentication: false })
}
