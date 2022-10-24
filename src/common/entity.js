class Victim {
    constructor(app_username, victim_id, victim_username, track_count, profile_picture_url, created_time) {
        this.app_username = app_username
        this.victim_id = victim_id
        this.victim_username = victim_username
        this.track_count = track_count
        this.profile_picture_url = profile_picture_url
        this.created_time = created_time || Date.now()

        this.is_victim = true
    }
    toORM() {
        return {
            PK: `USER@${this.app_username}`,
            SK: `CREATED_TIME@${this.created_time}#TWITTER_VICTIM@${this.victim_username}`,
            trackCount: this.track_count,
            profilePictureUrl: this.profile_picture_url,
            victimUsername: this.victim_username,
            isVictim: this.is_victim,
        }
    }

    toAPI() {
        return {
            app_username: this.app_username,
            victim_username: this.victim_username,
            track_count: this.track_count,
            profile_picture_url: this.profile_picture_url,
            created_time: this.created_time,
        }
    }

    static fromORM(orm) {
        const app_username = orm.PK.replace('USER@', '')
        let [
            created_time,
            victim_id,
        ] = orm.SK.split('#')
        created_time = created_time.replace('CREATED_TIME@', '')
        created_time = new Date(Number(created_time))
        victim_id = Number(victim_id.replace('TWITTER_VICTIM@', ''))
        const profile_picture_url = orm.profilePictureUrl
        const victim_type = orm.victimType
        const victim_username = orm.victimUsername
        const track_count = orm.trackCount || 0

        return new Victim(app_username, victim_id,
            victim_username, track_count,
            profile_picture_url, created_time,
        )
    }
}

class User {
    constructor(app_username, telegram_chat_id, subcribe_start, subcribe_end, track_count) {
        this.app_username = app_username
        this.telegram_chat_id = telegram_chat_id
        this.subcribe_start = subcribe_start || null
        this.subcribe_end = subcribe_end || null

        this.track_count = track_count || 0

    }

    toORM() {
        return {
            PK: `USER@${this.app_username}`,
            SK: `METADATA`,
            telegram_chat_id: this.telegram_chat_id,
            subcribe_start: this.subcribe_start,
            subcribe_end: this.subcribe_end,
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
    constructor(app_username, victim_id, following_username, picture_profile_url, updated_time) {
        this.app_username = app_username
        this.victim_id = victim_id
        this.following_username = following_username
        this.picture_profile_url = picture_profile_url
        this.created_time = updated_time || Date.now()
    }

    static fromTwitterAPI(app_username, victim_id, api, updated_time) {
        const following_username = api.content.itemContent.user_results.result.legacy.screen_name
        const picture_profile_url = api.content.itemContent.user_results.result.legacy.profile_image_url_https
        return new Following(app_username, victim_id, following_username, picture_profile_url, updated_time)
    }

    toORM() {
        return {
            PK: `USER@${this.app_username}`,
            SK: `UPDATED_TIME@${this.updated_time}#TWITTER_FOLLOWING@${this.following_username}#BY_TWITTER_VICTIM@${this.victim_id}`,
            pictureProfileUrl: this.picture_profile_url,
        }
    }

    toAPI() {
        return {
            app_username: this.app_username,
            victim_id: this.victim_id,
            following_username: this.following_username,
            picture_profile_url: this.picture_profile_url,
            updated_time: this.updated_time,
        }
    }

    static fromORM(orm) {
        const app_username = orm.PK.replace('USER@', '')
        let [
            updated_time,
            following_username,
            victim_id,
        ] = orm.SK.split('#')
        updated_time = updated_time.replace('UPDATED_TIME@', '')
        updated_time = new Date(Number(updated_time))
        victim_id = Number(victim_id.replace('BY_TWITTER_VICTIM@', ''))
        following_username = following_username.replace('BY_TWITTER_VICTIM@', '')
        const picture_profile_url = orm.pictureProfileUrl

        return new Following(app_username, victim_id, following_username, picture_profile_url, updated_time)
    }
}

module.exports = {
    Victim,
    User,
    Following,
}
