const axios = require('axios')

const INTERNAL_REQUEST_HEADERS = {
    'Authorization': process.env.AUTHORIZATION,
    'x-csrf-token': process.env.X_CSRF_TOKEN,
    'Cookie': `ct0=${process.env.X_CSRF_TOKEN};auth_token=${process.env.COOKIE_AUTH_TOKEN};`,
    'Content-Type': 'application/json',
}

const get_user_features_stringify = JSON.stringify({
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

const get_user_by_screenname_variables = {
    "screen_name": "jack",
    "withSafetyModeUserFields": true,
    "withSuperFollowsUserFields": true
}

const get_user_by_id_variables = {
    "userId": "12",
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
    "withSuperFollowsTweetFields": true,
    "cursor": "-1"
}
const GET_USER_BY_SCREENNAME_API = 'https://twitter.com/i/api/graphql/HThKoC4xtXHcuMIok4O0HA/UserByScreenName'
const GET_USER_BY_ID = 'https://twitter.com/i/api/graphql/h8lgEqxcqoXc7XAvK6lUeA/UserByRestId'
const GET_FOLLOWING_WEB_API_URL = 'https://twitter.com/i/api/graphql/pvBUaKeJsJF9jeth-OmlAQ/Following'

export const get_user_by_screenname = async (username) => {
    get_user_by_screenname_variables.screen_name = username
    const response = await axios.get(`${GET_USER_BY_SCREENNAME_API}`, {
        params: {
            variables: JSON.stringify(get_user_by_screenname_variables),
            features: get_user_features_stringify,
        },
        headers: INTERNAL_REQUEST_HEADERS,
    })
    return response.data
}

export const get_user_by_id = async (user_id: string) => {
    get_user_by_id_variables.userId = user_id
    const response = await axios.get(`${GET_USER_BY_ID}`, {
        params: {
            variables: JSON.stringify(get_user_by_id_variables),
            features: get_user_features_stringify,
        },
        headers: INTERNAL_REQUEST_HEADERS,
    })
    return response.data.data.user.result.legacy.friends_count
}

export const get_following_count_by_id = async (user_id: string) => {
    get_user_by_id_variables.userId = user_id
    const response = await axios.get(`${GET_USER_BY_ID}`, {
        params: {
            variables: JSON.stringify(get_user_by_id_variables),
            features: get_user_features_stringify,
        },
        headers: INTERNAL_REQUEST_HEADERS,
    })
    return response.data.data.user.result.legacy.friends_count
}

export const get_following_api = async (victim_id: string, cursor: string) => {
    get_following_variables.userId = victim_id
    get_following_variables.cursor = cursor
    let response_followings = await axios.get(GET_FOLLOWING_WEB_API_URL, {
        params: {
            variables: JSON.stringify(get_following_variables),
            features: get_following_features_stringify,
        },
        headers: INTERNAL_REQUEST_HEADERS,
    })
    return response_followings.data.data.user.result.timeline.timeline.instructions.find(e => e.entries !== undefined)
}