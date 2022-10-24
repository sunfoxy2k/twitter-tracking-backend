const axios = require('axios')
const { database, response_wrapper } = require('/opt/nodejs')
// const { scan_victim, response_wrapper } = require('../../../../../src/common/')
const { update_following_by_id } = require('./twitter')

const handleCheckAndUpdateVictims = async (victims) => {

    for (const victim of victims) {
        await update_following_by_id(victim)
    }
}

const main = async (event, context) => {
    const victims = await database.scan_all_victims('twitter')
    await handleCheckAndUpdateVictims(victims.Items)

    return {status: 'ok'}
}

exports.handler = async (event, context) => {
    return await response_wrapper(main)
}
