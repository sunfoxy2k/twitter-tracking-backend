const { database, response_wrapper } = require('/opt/nodejs')

const main = async (event, context) => {
    // get path parameters id
    const { id } = event.pathParameters
    const victims = await database.list_victims_by_app_username(id)

    return JSON.stringify(victims.Items.map((victim) => victim.toAPI()))
}

exports.handler = async (event, context) => {
    return await response_wrapper(main, event, context)
}
