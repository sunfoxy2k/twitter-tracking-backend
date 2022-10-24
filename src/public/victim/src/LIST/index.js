const { database, response_wrapper } = require('/opt/nodejs')

const main = async (event, context) => {
    const mock_user = 'tung'
    const victims = await database.list_victims_by_app_username(mock_user)

    return victims.Items.map((victim) => victim.toAPI())
}

exports.handler = async (event, context) => {
    return await response_wrapper(main)
}
