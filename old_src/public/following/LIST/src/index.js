const { database, response_wrapper } = require('/opt/nodejs')

const main = async (event, context) => {
    const {
        app_username,
        victim_id,
        created_time,
    } = event.queryStringParameters
    // const created_time = new Date(1666586950721)
    // const followings = await database.list_followings_by_victim_by_user(mock_victim)

    // return followings.Items.map((following) => following.toAPI())
    return 'asdasdasd'
}

exports.handler = async (event, context) => {
    return await response_wrapper(main)
}
