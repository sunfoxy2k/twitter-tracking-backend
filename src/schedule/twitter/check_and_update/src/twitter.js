const API_KEY = 'rhJoSwJXJW3mYPQmiV7Yhfk4A'
const API_KEY_SECRET = 'RjSjJJQ8phcsLJKh3z8z425QDlabpCtuLxCoNNOMpsQuyBpZdt'
const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAI3IiAEAAAAAjIFb3%2FK52UzrapilHCG%2BU9O6dj0%3Digh4LiT74EQfT570lkXpH3DUhNswwjMFDMP3p1uXt1vJlUyxAW'

const AUTHORIZATION = 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'
const USER_AGENT = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:106.0) Gecko/20100101 Firefox/106.0'
const X_CSRF_TOKEN = '6ff231a30d98c5c5279d49eabf40a823294328bb6eaae2908447ce6f52715b5aa6fc4bee6d2ab9ba785731abd8b11fd1bb15bf09fe254791171e03c56c79b224c6148c52bf603fceb8c16e03eb96899d'
const COOKIE = 'ct0=6ff231a30d98c5c5279d49eabf40a823294328bb6eaae2908447ce6f52715b5aa6fc4bee6d2ab9ba785731abd8b11fd1bb15bf09fe254791171e03c56c79b224c6148c52bf603fceb8c16e03eb96899d;auth_token=51febdf7b43ec6654bd93b60386cc409229e01cc'
const CONTENT_TYPE = 'application/json'
const REQUEST_HEADERS = {
    'Authorization': AUTHORIZATION,
    // 'User-Agent': USER_AGENT,
    'x-csrf-token': X_CSRF_TOKEN,
    'Cookie': COOKIE,
    'Content-Type': CONTENT_TYPE
}

const ACCESS_TOKEN = '2954164566-js2zZqDU1Y3mgVkTtC439gdLbllTIZFdy33XVyQ'
const ACCESS_TOKEN_SECRET = 'e7LjcikwGP1aRliqKPoDF2L2nl5HXAnqlAUGB9Yo2w8Lc'
const CLIENT_ID = 'T0tRbmxBTWk0ekRYeEl0TFNhWmo6MTpjaQ'
const CLIENT_SECRET = 'dchq9rqFXHGgzijQOzAq0XyF20K33XxAfNdDP3GmTfOHHVa9t4'
const USER_API = 'https://api.twitter.com/2/users/by'
const FOLLOWING_API = 'https://api.twitter.com/2/users/INPUT_USER_ID/following'
const USER_SCOPE = ['entities', 'id', 'location', 'name', 'profile_image_url', 'protected', 'public_metrics', 'username', 'verified', 'withheld']
const FOLLOWING_SCOPE = ['id', 'name', 'profile_image_url', 'protected', 'username', 'verified', 'withheld']
const axios = require('axios')
const { database, entity } = require('/opt/nodejs')


const get_user_by_username = async (username) => {

    const response = await axios.get(`${USER_API}`, {
        params: {
            usernames: username,
            'user.fields': USER_SCOPE.join(',')
        },
        headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`
        }
    })
    const followings = response.data.user.result.timeline.timeline.instructions.find(e => e.entries !== undefined)

    return response.data
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

const FOLLOWNG_API_URL = 'https://twitter.com/i/api/graphql/pvBUaKeJsJF9jeth-OmlAQ/Following'


const update_following_by_id = async (victim) => {
    // api_following_variables.userId = victim.victim_id
    try {
        const response = await axios.get(FOLLOWNG_API_URL, {
            params: {
                variables: JSON.stringify(api_following_variables),
                features: api_following_features,
            },
            headers: REQUEST_HEADERS
        })
        let followings = response.data.data.user.result.timeline.timeline.instructions.find(e => e.entries !== undefined)
        followings = followings.entries.filter((item) => item.content.entryType === 'TimelineTimelineItem')
        for (let following of followings) {
            following = entity.Following.fromTwitterAPI(victim.app_username, victim.victim_id, following)
            await database.insert_entity(following)
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    get_user_by_username,
    get_twitter_id_by_username,
    update_following_by_id,
}
