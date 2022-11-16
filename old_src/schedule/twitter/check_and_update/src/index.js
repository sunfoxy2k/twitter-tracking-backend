const { database, response_wrapper } = require('/opt/nodejs')
// const { scan_victim, response_wrapper } = require('../../../../../src/common/')
const { schedule_update_following_by_id_old } = require('./twitter')
const { TwitterSchedulerClient } = require('./new-twitter')


const main = async (event, context) => {
    let cursor = 'dummy'
    const twitter_scheduler_client = new TwitterSchedulerClient()
    while (cursor) {
        let victims = await database.scan_victims_with_cursor(cursor)
        cursor = victims.LastEvaluatedKey
        twitter_scheduler_client.processing_victims = victims.Items
        await twitter_scheduler_client.sync_update_following()
    }

    return { status: 'ok' }
}

exports.handler = async (event, context) => {
    return await response_wrapper(main)
}
