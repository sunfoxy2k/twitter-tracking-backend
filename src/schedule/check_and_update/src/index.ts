import { response_wrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { scan_victims_with_cursor } from '/opt/nodejs/database';
import { TwitterSchedulerClient } from "./TwitterSchedulerClient";
import { Victim } from "/opt/nodejs/entity";

const main = async () => {
    let cursor: any = 'dummy'
    const twitter_scheduler_client = new TwitterSchedulerClient()
    while (cursor) {
        let victims = await scan_victims_with_cursor(cursor)
        cursor = victims.LastEvaluatedKey
        twitter_scheduler_client.processing_victims = victims.Items as Victim[]
        await twitter_scheduler_client.sync_update_following()
    }

    return { status: 'ok' }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await response_wrapper({ main })
}
