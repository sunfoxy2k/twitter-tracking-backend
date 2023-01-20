import { responseWrapper } from "/opt/nodejs/response";
import { scanVictimsWithCursor } from '/opt/nodejs/database/victim';
import { TwitterSchedulerClient } from "./TwitterSchedulerClient";
import { Victim } from "/opt/nodejs/entity/Victim";

const main = async () => {
    let cursor: any = 'dummy'
    const twitter_scheduler_client = new TwitterSchedulerClient()
    while (cursor) {
        let victims = await scanVictimsWithCursor(cursor)
        cursor = victims.LastEvaluatedKey
        twitter_scheduler_client.processingVictims = victims.Items as Victim[]
        await twitter_scheduler_client.syncUpdateFollowing()
    }

    return { status: 'ok' }
}

exports.handler = async (event, context) => {
    return await responseWrapper({ main, authentication: false })
}
