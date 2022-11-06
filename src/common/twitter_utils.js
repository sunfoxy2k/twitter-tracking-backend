const axios = require('axios')

const INTERNAL_REQUEST_HEADERS = {
    'Authorization': process.env.AUTHORIZATION,
    'x-csrf-token': process.env.X_CSRF_TOKEN,
    'Cookie': `ct0=${process.env.X_CSRF_TOKEN};auth_token=${process.env.COOKIE_AUTH_TOKEN};`,
    'Content-Type': 'application/json',
}

const get_user_by_screename_features_stringify = JSON.stringify({
    "verified_phone_label_enabled": false,
    "responsive_web_graphql_timeline_navigation_enabled": false
})

const get_following_features_stringify = JSON.stringify({
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

const get_user_by_screename_variables = {
    "screen_name": "hoangtung1802",
    "withSafetyModeUserFields": true,
    "withSuperFollowsUserFields": true
}


const get_following_variables = {
    "userId": "2954164566",
    "count": 200,
    "includePromotedContent": false,
    "withSuperFollowsUserFields": true,
    "withDownvotePerspective": true,
    "withReactionsMetadata": false,
    "withReactionsPerspective": false,
    "withSuperFollowsTweetFields": true
}
const GET_USER_BY_SCREENNAME_API = 'https://twitter.com/i/api/graphql/HThKoC4xtXHcuMIok4O0HA/UserByScreenName'

const GET_FOLLOWNG_WEB_API_URL = 'https://twitter.com/i/api/graphql/pvBUaKeJsJF9jeth-OmlAQ/Following'

const get_user_by_screename = async (app_username, username) => {
    get_user_by_screename_variables.screen_name = username
    const response = await axios.get(`${USER_API}`, {
        params: {
            variables: JSON.stringify(get_user_by_screename_variables),
            features: get_user_by_screename_features_stringify,
        },
        headers: INTERNAL_REQUEST_HEADERS,
    })
}
const get_following_api = async (victim_id, cursor) => {
    get_following_variables.userId = victim_id
    get_following_variables.cursor = cursor
    let response_followings = await axios.get(GET_FOLLOWNG_WEB_API_URL, {
        params: {
            variables: JSON.stringify(get_following_variables),
            features: get_following_features_stringify,
        },
        headers: INTERNAL_REQUEST_HEADERS,
    })
    return response_followings.data.data.user.result.timeline.timeline.instructions.find(e => e.entries !== undefined)
}

module.exports = {
    INTERNAL_REQUEST_HEADERS,
    GET_USER_BY_SCREENNAME_API,
    GET_FOLLOWNG_WEB_API_URL,
    get_user_by_screename_features_stringify,
    get_user_by_screename_variables,
    get_following_variables,
    get_user_by_screename,
    get_following_api,
}