const { database, entity, twitter } = require('/opt/nodejs')
const { send_message } = require('./telegram')
const schedule_update_following_by_id = async (victim) => {
    try {
        const user = await database.get_user_by_username(victim.app_username)
        const current_followings = await database.list_followings_by_victim_by_user(victim.app_username, victim.victim_id)
        const response_followings = await get_and_update_following_by_id(victim, current_followings)


        // remove exsited followings from response and current
        // => what left in response_followings are new followings
        // => what left in current_followings  are deleted followings
        // for (let key of Object.keys(response_followings)) {
        //     if (current_followings[key] !== undefined) {
        //         delete current_followings[key]
        //         delete response_followings[key]
        //     }
        // }
        await database.batch_update_following(Object.values(response_followings), Object.values(current_followings))

        await send_message(user, victim, response_followings, current_followings)
    } catch (error) {
        console.log('ERROR update_following_by_id: ', error)
    }
}

const get_and_update_following_by_id = async (victim, current_followings) => {

    let cursor = '-1'
    let followings = {}
    let following_count = 0
    try {
        while (cursor.startsWith('0|') === false) {
            let response_followings = await twitter.get_following_api(victim.victim_id, cursor)
            response_followings = parse_following_from_api_entries(victim.app_username, victim.victim_id, response_followings.entries, current_followings)

            followings = { ...followings, ...response_followings.followings }
            cursor = response_followings.cursor_bottom
            following_count += response_followings.following_count
        }
        victim.track_count = following_count
        await database.put_entity(victim)
        return followings
    } catch (error) {
        console.log('ERROR update_following_by_id: ', error)
        Promise.reject(error)
    }
}

const parse_following_from_api_entries = (app_username, victim_id, response_followings, current_followings) => {
    const followings = {}
    const cursor_top = response_followings[response_followings.length - 1].content.value
    response_followings.pop()
    const cursor_bottom = response_followings[response_followings.length - 1].content.value
    response_followings.pop()

    const following_count = response_followings.length
    // remove exsited followings from response and current
    // => what left in response_followings are new followings
    // => what left in current_followings  are deleted followings
    response_followings.forEach((following) => {
        const result = following.content.itemContent.user_results.result
        if (result.__typename !== 'UserUnavailable') {
            if (current_followings[result.legacy.screen_name] === undefined) {
                followings[result.legacy.screen_name] =
                    entity.Following.fromTwitterAPI(app_username, victim_id, following)
            }
            else {
                delete current_followings[result.legacy.screen_name]
            }
        }
    })
    return {
        followings,
        cursor_top,
        cursor_bottom,
        following_count,
    }
}

module.exports = {
    schedule_update_following_by_id,
}
