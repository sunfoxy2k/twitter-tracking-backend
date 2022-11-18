import { TwitterUserItem } from "./twitter-utils";
export interface VictimInput {
    app_username: string;
    victim_id: string;
    victim_username: string;
    track_count: number;
    profile_picture_url: string;
    created_time?: Date;
    update_time?: Date;
}

export interface UserInput {
    app_username: string;
    telegram_chat_id: string;
    subscribe_start?: Date;
    subscribe_end?: Date;
    track_count: number;
}

export interface FollowingInput {
    app_username: string;
    victim_id: string;
    following_username: string;
    picture_profile_url: string;
    update_time?: Date;
}

export abstract class Entity {
    toORM(): any {
        throw new Error('not implemented');
    };
    static fromORM(orm: any): Entity{
        throw new Error('not implemented');
    }

    toAPI(): any {
        throw new Error('not implemented');
    }
    toQueryKey(): {PK: string, SK: string} {
        throw new Error('not implemented');
    }
}

export class Victim extends Entity {
    public app_username: string;
    public victim_id: string;
    public victim_username: string;
    public track_count: number; 
    public profile_picture_url: string;
    public victim_type: string;
    public created_time: Date;
    public update_time: Date;

    constructor(input: VictimInput) {
        super();
        this.app_username = input.app_username;
        this.victim_id = input.victim_id;
        this.victim_username = input.victim_username;
        this.track_count = input.track_count;
        this.profile_picture_url = input.profile_picture_url;
        this.created_time = input.created_time || new Date();
        this.update_time = input.update_time || new Date();

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
            updateTime: this.update_time.valueOf(),
        }
    }

    toAPI() {
        return {
            userName: this.app_username,
            victim_username: this.victim_username,
            totalFollowing: this.track_count,
            pictureProfileUrl: this.profile_picture_url,
            createTime: this.created_time.valueOf(),
            updateTime: this.update_time.valueOf(),
            // victim_type: this.victim_type,
        }
    }

    static fromORM(orm: any): Victim {
        const app_username = orm.PK.replace('USER@', '')
        let [
            created_time,
            victim_id,
        ] = orm.SK.split('#')
        created_time = created_time.replace('CREATED_TIME@', '')
        created_time = Number(created_time)
        created_time = new Date(created_time)
        victim_id = victim_id.replace('TWITTER_VICTIM@', '')
        const profile_picture_url = orm.profilePictureUrl
        // const victim_type = orm.victimType
        const victim_username = orm.victimUsername
        const track_count = orm.trackCount || 0
        const update_time = new Date(orm.updateTime)

        return new Victim({
            app_username,
            victim_id,
            victim_username,
            track_count,
            profile_picture_url,
            created_time,
            update_time,
        })
    }

    static fromTwitterAPI(app_username: string, api: TwitterUserItem): Victim {
        const victim_id = api.rest_id
        const victim_username = api.legacy.screen_name
        const track_count = api.legacy.friends_count || 0
        const profile_picture_url = api.legacy.profile_image_url_https
        const created_time = new Date()
        return new Victim({
            app_username,
            victim_id,
            victim_username,
            track_count,
            profile_picture_url,
            created_time,
        })
    }

    toQueryKey() {
        return {
            PK: `USER@${this.app_username}`,
            SK: `CREATED_TIME@${this.created_time.valueOf()}#TWITTER_VICTIM@${this.victim_id}`,
        }
    }
}

export class User {
    app_username: any;
    telegram_chat_id: any;
    subscribe_start: any;
    subscribe_end: any;
    track_count: any;
    constructor(input: UserInput) {
        this.app_username = input.app_username;
        this.telegram_chat_id = input.telegram_chat_id;
        // this.subscribe_start = input.subscribe_start || new Date();
        // this.subscribe_end = input.subscribe_end || new Date();
        this.track_count = input.track_count || 0;
    }

    toORM() {
        return {
            PK: `USER@${this.app_username}`,
            SK: `METADATA`,
            telegramChatId: this.telegram_chat_id,
            trackCount: this.track_count || 0,
            // subscribeStart: this.subscribe_start,
            // subscribeEnd: this.subscribe_end,
        }
    }

    toAPI() {
        return {
            app_username: this.app_username,
            telegramChatId: this.telegram_chat_id,
            trackCount: this.track_count,
            // subscribeStart: this.subscribe_start,
            // subscribeEnd: this.subscribe_end,
        }
    }

    static fromORM(orm): User {
        const app_username = orm.PK.replace('USER@', '')
        const telegram_chat_id = orm.telegramChatId
        const track_count = orm.trackCount
        return new User({
            app_username,
            telegram_chat_id,
            track_count,
        })
    }

    toQueryKey() {
        return {
            PK: `USER@${this.app_username}`,
            SK: `METADATA`,
        }
    }
}

export class Following {
    public app_username: string;
    public victim_id: string;
    public following_username: string;
    public picture_profile_url: string;
    public update_time: Date;
    constructor(input: FollowingInput) {
        this.app_username = input.app_username;
        this.victim_id = input.victim_id;
        this.following_username = input.following_username;
        this.picture_profile_url = input.picture_profile_url;
        this.update_time = input.update_time || new Date();
    }

    static fromTwitterAPI(app_username: string, victim_id: string, api: TwitterUserItem) {
        const following_username = api.legacy.screen_name
        const picture_profile_url = api.legacy.profile_image_url_https
        return new Following({
            app_username,
            victim_id,
            following_username,
            picture_profile_url,
        })
    }

    toORM() {
        return {
            PK: `TWITTER_VICTIM@${this.victim_id}#USER@${this.app_username}`,
            SK: `UPDATE_TIME@${this.update_time.valueOf()}#TWITTER_FOLLOWING@${this.following_username}`,
            pictureProfileUrl: this.picture_profile_url,
        }
    }

    toAPI() {
        return {
            userName: this.following_username,
            victim_id: this.victim_id,
            following_username: this.following_username,
            pictureProfileUrl: this.picture_profile_url,
            updateTime: this.update_time,
            profileUrl: `https://twitter.com/${this.following_username}`,
        }
    }

    getORMKey() {
        return {
            PK: `TWITTER_VICTIM@${this.victim_id}#USER@${this.app_username}`,
            SK: `UPDATE_TIME@${this.update_time}#TWITTER_FOLLOWING@${this.following_username}`,
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
            update_time,
            following_username,
        ] = orm.SK.split('#')
        update_time = update_time.replace('UPDATE_TIME@', '')
        update_time = Number(update_time)

        following_username = following_username.replace('TWITTER_FOLLOWING@', '')
        const picture_profile_url = orm.pictureProfileUrl

        return new Following({
            app_username,
            victim_id,
            following_username,
            picture_profile_url,

        })
    }

    toQueryKey() {
        return {
            PK: `TWITTER_VICTIM@${this.victim_id}#USER@${this.app_username}`,
            SK: `UPDATE_TIME@${this.update_time}#TWITTER_FOLLOWING@${this.following_username}`,
        }
    }
}
