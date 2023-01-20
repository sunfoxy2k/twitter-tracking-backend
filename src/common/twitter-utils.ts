import { Following } from "./entity/Following"

const axios = require('axios')

const INTERNAL_REQUEST_HEADERS_SCHEDULE = {
    'Authorization': process.env.TWITTER_AUTHORIZATION_SCHEDULE,
    'x-csrf-token': process.env.X_CSRF_TOKEN_SCHEDULE,
    'Cookie': `ct0=${process.env.X_CSRF_TOKEN_SCHEDULE};auth_token=${process.env.COOKIE_AUTH_TOKEN_SCHEDULE};`,
    'Content-Type': 'application/json',
}

const INTERNAL_REQUEST_HEADERS_CRUD = {
    'Authorization': process.env.TWITTER_AUTHORIZATION_CRUD,
    'x-csrf-token': process.env.X_CSRF_TOKEN_CRUD,
    'Cookie': `ct0=${process.env.X_CSRF_TOKEN_CRUD};auth_token=${process.env.COOKIE_AUTH_TOKEN_CRUD};`,
    'Content-Type': 'application/json',
}

const getUserFeaturesStringify = JSON.stringify({
    "verified_phone_label_enabled": false,
    "responsive_web_graphql_timeline_navigation_enabled": false
})

const getFollowingFeaturesStringify = JSON.stringify({
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

const getUserByScreennameVariables = {
    "screen_name": "jack",
    "withSafetyModeUserFields": true,
    "withSuperFollowsUserFields": true
}

const getUserByIdVariables = {
    "userId": "12",
    "withSafetyModeUserFields": true,
    "withSuperFollowsUserFields": true
}

const getFollowingVariables = {
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

export interface TwitterUserItem {
    __typename: 'User' | 'UserUnavailable';
    id: string;
    rest_id: string;
    has_nft_avatar: boolean;
    legacy: {
        can_dm: boolean;
        created_at: string;
        default_profile: boolean;
        default_profile_image: boolean;
        description: string;
        follow_request_sent: boolean;
        followers_count: number;
        following: boolean;
        friends_count: number;
        has_custom_timelines: boolean;
        location: string;
        name: string;
        pinned_tweet_ids_str: string[];
        possibly_sensitive: boolean;
        profile_banner_url: string;
        profile_image_url_https: string;
        protected: boolean;
        screen_name: string;
        statuses_count: number;
        verified: boolean;
    }
}
export interface TwitterUserResponseApi {
    data: {
        user: {
            result: TwitterUserItem
        }
    }
}
export interface CursorTop {
    entryId: string;
    content: {
        entryType: 'TimelineTimelineCursor';
        __typename: 'TimelineTimelineCursor';
        value: string;
        cursorType: 'Top';
    }
}

export interface CursorBottom {
    entryId: string;
    content: {
        entryType: 'TimelineTimelineCursor';
        __typename: 'TimelineTimelineCursor';
        value: string;
        cursorType: 'Bottom';
    }
}

export interface FollowingEdge {
    content: {
        itemContent: {
            user_results: { result: TwitterUserItem };
        }
    }
}

export interface TwitterFollowingResponseApi {
    data: {
        user: {
            result: {
                __typename: 'User';
                timeline: {
                    timeline: {
                        instructions: [
                            {
                                type: 'TimelineAddEntries';
                                entries: Array<CursorTop | CursorBottom | FollowingEdge>;
                            }
                        ]
                    }
                }
            }
        }
    }
}

export const getTwitterUserByScreenname = async (screenName: string): Promise<TwitterUserResponseApi> => {
    getUserByScreennameVariables.screen_name = screenName
    const response = await axios.get(`${GET_USER_BY_SCREENNAME_API}`, {
        params: {
            variables: JSON.stringify(getUserByScreennameVariables),
            features: getUserFeaturesStringify,
        },
        headers: INTERNAL_REQUEST_HEADERS_CRUD,
    })
    return response.data
}

export const getFollowingCountById = async (userId: string) => {
    getUserByIdVariables.userId = userId
    const response: { data: TwitterUserResponseApi } = await axios.get(`${GET_USER_BY_ID}`, {
        params: {
            variables: JSON.stringify(getUserByIdVariables),
            features: getUserFeaturesStringify,
        },
        headers: INTERNAL_REQUEST_HEADERS_CRUD,
    })
    return response.data.data.user.result.legacy.friends_count
}

export const getFollowingApi = async (victimId: string, cursor: string) => {
    getFollowingVariables.userId = victimId
    getFollowingVariables.cursor = cursor
    let responseFollowings: { data: TwitterFollowingResponseApi } = await axios.get(GET_FOLLOWING_WEB_API_URL, {
        params: {
            variables: JSON.stringify(getFollowingVariables),
            features: getFollowingFeaturesStringify,
        },
        headers: INTERNAL_REQUEST_HEADERS_SCHEDULE,
    })
    return responseFollowings.data.data.user.result.timeline.timeline.instructions.find(e => e.type === 'TimelineAddEntries').entries
}

export const getAllFollowingApi = async (appUsername: string, victimId: string): Promise<Following[]> => {
    let cursor: string | CursorBottom = '-1'
    let all_followings: Following[] = []
    while (cursor.startsWith('0|') === false) {
        let responseFollowings = await getFollowingApi(victimId, cursor)
        cursor = responseFollowings[responseFollowings.length - 2] as CursorBottom
        cursor = cursor.content.value as string
        let edges: FollowingEdge[] = responseFollowings.slice(0, responseFollowings.length - 2) as FollowingEdge[]

        for (let edge of edges) {
            const result = edge.content.itemContent.user_results.result
            if (result.__typename !== 'UserUnavailable') {
                all_followings.push(Following.fromTwitterAPI(appUsername, victimId, result))
            }
        }
    }
    return all_followings
}
