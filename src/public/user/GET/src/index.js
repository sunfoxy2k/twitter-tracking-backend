const { database, response_wrapper } = require('/opt/nodejs')

const main = async (event, context) => {
    const app_username = event.queryStringParameters.app_username
    if (!app_username) {
        throw new Error('app_username is required')
    }
    const user = await database.get_user_by_username(mock_user)
    
    return JSON.stringify(user.toAPI())
}

exports.handler = async (event, context) => {
    return await response_wrapper(main, event, context)
}
