const { database, response_wrapper } = require('/opt/nodejs')

const main = async (event, context) => {
    const mock_user = 'tung'
    const user = await database.get_user_by_username(mock_user)

    return user.toAPI()
}

exports.handler = async (event, context) => {
    return await response_wrapper(main)
}
