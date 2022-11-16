class Victim {
    constructor(app_username, victim_id, victim_username, track_count, profile_picture_url, created_time) {
        this.app_username = app_username
        this.victim_id = victim_id
        this.victim_username = victim_username
        this.track_count = track_count
        this.profile_picture_url = profile_picture_url
        this.created_time = created_time || Date.now()

        this.victim_type = 'twitter'
    }
    toORM() {
        return {
            PK: `USER@${this.app_username}`,
            SK: `CREATED_TIME@${this.created_time.valueOf()}#TWITTER_VICTIM@${this.victim_id}`,
            trackCount: this.track_count,
            profilePictureUrl: this.profile_picture_url,
            victimUsername: this.victim_username,
            victimType: this.victim_type,
        }
    }

    toAPI() {
        return {
            userName: this.app_username,
            victim_username: this.victim_username,
            totalFollowing: this.track_count,
            pictureProfileUrl: this.profile_picture_url,
            createTime: this.created_time,
            // victim_type: this.victim_type,
        }
    }

    static fromORM(orm) {
        const app_username = orm.PK.replace('USER@', '')
        let [
            created_time,
            victim_id,
        ] = orm.SK.split('#')
        created_time = created_time.replace('CREATED_TIME@', '')
        created_time = Number(created_time)
        victim_id = victim_id.replace('TWITTER_VICTIM@', '')
        const profile_picture_url = orm.profilePictureUrl
        // const victim_type = orm.victimType
        const victim_username = orm.victimUsername
        const track_count = orm.trackCount || 0

        return new Victim(app_username, victim_id,
            victim_username, track_count,
            profile_picture_url, created_time,
        )
    }

    static fromAPI(app_username, api) {
        const victim_id = api.rest_id
        const victim_username = api.screen_name
        const track_count = api.friends_count || 0
        const profile_picture_url = api.profile_image_url_https
        const created_time = Date.now()
        return new Victim(app_username, victim_id,
            victim_username, track_count,
            profile_picture_url, created_time,
        )
    }
}

class User {
    constructor(app_username, telegram_chat_id, subscribe_start, subscribe_end, track_count) {
        this.app_username = app_username
        this.telegram_chat_id = telegram_chat_id
        this.subscribe_start = subscribe_start || null
        this.subscribe_end = subscribe_end || null

        this.track_count = track_count || 0

    }

    toORM() {
        return {
            PK: `USER@${this.app_username}`,
            SK: `METADATA`,
            telegramChatId: this.telegram_chat_id,
            subscribeStart: this.subscribe_start,
            subscribeEnd: this.subscribe_end,
        }
    }

    toAPI() {
        return {
            app_username: this.app_username,
            telegram_chat_id: this.telegram_chat_id
        }
    }

    static fromORM(orm) {
        const app_username = orm.PK.replace('USER@', '')
        const telegram_chat_id = orm.telegramChatId

        return new User(app_username, telegram_chat_id)
    }
}

class Following {
    constructor(app_username, victim_id, following_username, picture_profile_url, created_time) {
        this.app_username = app_username
        this.victim_id = victim_id
        this.following_username = following_username
        this.picture_profile_url = picture_profile_url
        this.created_time = created_time || Date.now()
    }

    static fromTwitterAPI(app_username, victim_id, api, created_time) {
        const following_username = api.content.itemContent.user_results.result.legacy.screen_name
        const picture_profile_url = api.content.itemContent.user_results.result.legacy.profile_image_url_https
        return new Following(app_username, victim_id, following_username, picture_profile_url, created_time)
    }

    toORM() {
        return {
            PK: `TWITTER_VICTIM@${this.victim_id}#USER@${this.app_username}`,
            SK: `CREATED_TIME@${this.created_time}#TWITTER_FOLLOWING@${this.following_username}`,
            pictureProfileUrl: this.picture_profile_url,
        }
    }

    toAPI() {
        return {
            app_username: this.app_username,
            victim_id: this.victim_id,
            following_username: this.following_username,
            picture_profile_url: this.picture_profile_url,
            created_time: this.created_time,
        }
    }

    getORMKey() {
        return {
            PK: `TWITTER_VICTIM@${this.victim_id}#USER@${this.app_username}`,
            SK: `CREATED_TIME@${this.created_time}#TWITTER_FOLLOWING@${this.following_username}`,
        }
    }

    static fromORM(orm) {
        let [
            victim_id,
            app_username,
        ] = orm.PK.split('#')
        victim_id = victim_id.replace('TWITTER_VICTIM@', '')
        app_username = app_username.replace('USER@', '')
        let [
            created_time,
            following_username,
        ] = orm.SK.split('#')
        created_time = created_time.replace('CREATED_TIME@', '')
        created_time = Number(created_time)

        following_username = following_username.replace('TWITTER_FOLLOWING@', '')
        const picture_profile_url = orm.pictureProfileUrl

        return new Following(app_username, victim_id, following_username, picture_profile_url, created_time)
    }
}

module.exports = {
    Victim,
    User,
    Following,
}
