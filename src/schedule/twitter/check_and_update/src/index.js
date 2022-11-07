const { database, response_wrapper } = require('/opt/nodejs')
// const { scan_victim, response_wrapper } = require('../../../../../src/common/')
const { schedule_update_following_by_id_old } = require('./twitter')

const main = async (event, context) => {
    let cursor = 'dummy'
    while (cursor) {
        let victims = await database.scan_victims_with_cursor(cursor)
        cursor = victims.LastEvaluatedKey
        
        // victims = victims.Items.map((victim) => {
        //     return new Promise(async (resolve, reject) => {
        //         try {
        //             resolve(await schedule_update_following_by_id(victim))
        //         } catch (error) {
        //             reject(error)
        //         }
        //     })
        // })

        // await Promise.all(victims)

        for (let victim of victims.Items) {
            await schedule_update_following_by_id_old(victim)
        }
    }

    return { status: 'ok' }
}

exports.handler = async (event, context) => {
    return await response_wrapper(main)
}
