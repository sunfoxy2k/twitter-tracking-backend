const axios = require('axios')
const { database, entity } = require('/opt/nodejs')
const { send_message } = require('./telegram')

const REQUEST_HEADERS = {
    'Authorization': process.env.AUTHORIZATION,
    'x-csrf-token': process.env.X_CSRF_TOKEN,
    'Cookie': `ct0=${process.env.X_CSRF_TOKEN};auth_token=${process.env.COOKIE_AUTH_TOKEN};`,
    'Content-Type': 'application/json',
}
const USER_API = 'https://api.twitter.com/2/users/by'
const USER_SCOPE = ['entities', 'id', 'location', 'name', 'profile_image_url', 'protected', 'public_metrics', 'username', 'verified', 'withheld']
// const FOLLOWING_API = 'https://api.twitter.com/2/users/INPUT_USER_ID/following'
// const FOLLOWING_SCOPE = ['id', 'name', 'profile_image_url', 'protected', 'username', 'verified', 'withheld']
const FOLLOWNG_WEB_API_URL = 'https://twitter.com/i/api/graphql/pvBUaKeJsJF9jeth-OmlAQ/Following'

const api_following_features = JSON.stringify({
    "verified_phone_label_enabled": false,
    "responsive_web_graphql_timeline_navigation_enabled": true,
    "unified_cards_ad_metadata_container_dynamic_card_content_query_enabled": true,
    "tweetypie_unmention_optimization_enabled": true,
    "responsive_web_uc_gql_enabled": true,
    "vibe_api_enabled": true,
    "responsive_web_edit_tweet_api_enabled": true,
    "graphql_is_translatable_rweb_tweet_is_translatable_enabled": true,
    "standardized_nudges_misinfo": true,
    "tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled": false,
    "interactive_text_enabled": true,
    "responsive_web_text_conversations_enabled": false,
    "responsive_web_enhance_cards_enabled": true
})

const api_following_variables = {
    "userId": "2954164566",
    "count": 200,
    "includePromotedContent": false,
    "withSuperFollowsUserFields": true,
    "withDownvotePerspective": true,
    "withReactionsMetadata": false,
    "withReactionsPerspective": false,
    "withSuperFollowsTweetFields": true
}

const get_user_by_username = async (username) => {

    const response = await axios.get(`${USER_API}`, {
        params: {
            usernames: username,
            'user.fields': USER_SCOPE.join(',')
        },
        headers: {
            'Authorization': `Bearer ${process.env.BEARER_TOKEN}`
        }
    })
    const followings = response.data.user.result.timeline.timeline.instructions.find(e => e.entries !== undefined)

    return followings
}

const get_twitter_id_by_username = async (username) => {
    const data = `input=${username}`;

    const config = {
        method: 'post',
        url: 'https://tweeterid.com/ajax.php',
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:105.0) Gecko/20100101 Firefox/105.0',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        data: data
    };

    const reponse = await axios(config)

    return reponse.data
}

const schedule_update_following_by_id = async (victim) => {
    api_following_variables.userId = victim.victim_id
    try {
        const user = await database.get_user_by_username(victim.app_username)
        const current_followings = await database.list_followings_by_victim_by_user(victim.app_username, victim.victim_id)
        const response_followings = await get_following_by_id(victim, current_followings)


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

const get_following_by_id = async (victim, current_followings) => {
    api_following_variables.userId = victim.victim_id
    let cursor = '-1'
    let followings = {}
    let following_count = 0
    try {
        while (cursor.startsWith('0|') === false) {
            api_following_variables.cursor = cursor
            let response_followings = await axios.get(FOLLOWNG_WEB_API_URL, {
                params: {
                    variables: JSON.stringify(api_following_variables),
                    features: api_following_features,
                },
                headers: REQUEST_HEADERS
            })
            response_followings = response_followings.data.data.user.result.timeline.timeline.instructions.find(e => e.entries !== undefined)
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
    get_user_by_username,
    get_twitter_id_by_username,
    schedule_update_following_by_id,
}
