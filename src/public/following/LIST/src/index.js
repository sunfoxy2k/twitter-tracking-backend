const { database, response_wrapper } = require('/opt/nodejs')

const main = async (event, context) => {
    const mock_user = 'tung'
    const followings = await database.list_followings_by_app_username(mock_user)

    return followings.Items.map((following) => following.toAPI())
}

exports.handler = async (event, context) => {
    return await response_wrapper(main)
}
