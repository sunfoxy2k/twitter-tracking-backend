const { database, response_wrapper } = require('/opt/nodejs')
// const { scan_victim, response_wrapper } = require('../../../../../src/common/')
const { update_following_by_id } = require('./twitter')

const main = async (event, context) => {
    const victims = await database.scan_all_victims('twitter')
    for (const victim of victims.Items) {
        await update_following_by_id(victim)
    }

    return { status: 'ok' }
}

exports.handler = async (event, context) => {
    return await response_wrapper(main)
}
