import { TwitterUserItem } from "./twitter-utils";
export interface VictimInput {
    appEmail: string;
    victimId: string;
    victimUsername: string;
    trackCount: number;
    profilePictureUrl?: string;
    createdTime?: Date;
    updateTime?: Date;
}

export interface UserInput {
    appEmail: string;
    telegramChatId: string;
    subscribeStart?: Date;
    subscribeEnd?: Date;
    trackCount: number;
}

export interface FollowingInput {
    appEmail: string;
    victimId: string;
    followingUsername: string;
    profilePictureUrl: string;
    updateTime?: Date;
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
    public appEmail: string;
    public victimId: string;
    public victimUsername: string;
    public trackCount: number; 
    public profilePictureUrl: string;
    public victimType: string;
    public createdTime: Date;
    public updateTime: Date;

    constructor(input: VictimInput) {
        super();
        this.appEmail = input.appEmail;
        this.victimId = input.victimId;
        this.victimUsername = input.victimUsername;
        this.trackCount = input.trackCount;
        this.profilePictureUrl = input.profilePictureUrl;
        this.createdTime = input.createdTime || new Date();
        this.updateTime = input.updateTime || new Date();

        this.victimType = 'twitter'
    }
    toORM() {
        return {
            PK: `USER@${this.appEmail}`,
            SK: `CREATED_TIME@${this.createdTime.valueOf()}#TWITTER_VICTIM@${this.victimId}`,
            trackCount: this.trackCount,
            profilePictureUrl: this.profilePictureUrl,
            victimUsername: this.victimUsername,
            victimType: this.victimType,
            updateTime: this.updateTime.valueOf(),
        }
    }

    toAPI() {
        return {
            // email: this.appEmail,
            userName: this.victimUsername,
            totalFollowing: this.trackCount,
            pictureProfileUrl: this.profilePictureUrl,
            createTime: this.createdTime.valueOf(),
            updateTime: this.updateTime.valueOf(),
            id: this.toQueryKey().SK,
            // victimType: this.victimType,
        }
    }

    static fromORM(orm: any): Victim {
        const appEmail = orm.PK.replace('USER@', '')
        let [
            createdTime,
            victimId,
        ] = orm.SK.split('#')
        createdTime = createdTime.replace('CREATED_TIME@', '')
        createdTime = Number(createdTime)
        createdTime = new Date(createdTime)
        victimId = victimId.replace('TWITTER_VICTIM@', '')
        const profilePictureUrl = orm.profilePictureUrl
        // const victimType = orm.victimType
        const victimUsername = orm.victimUsername
        const trackCount = orm.trackCount || 0
        const updateTime = orm.updateTime

        return new Victim({
            appEmail,
            victimId,
            victimUsername,
            trackCount,
            profilePictureUrl,
            createdTime,
            updateTime,
        })
    }

    static fromTwitterAPI(appEmail: string, api: TwitterUserItem): Victim {
        const victimId = api.rest_id
        const victimUsername = api.legacy.screen_name
        const trackCount = api.legacy.friends_count || 0
        const profilePictureUrl = api.legacy.profile_image_url_https
        const createdTime = new Date()
        return new Victim({
            appEmail,
            victimId,
            victimUsername,
            trackCount,
            profilePictureUrl,
            createdTime,
        })
    }

    toQueryKey() {
        return {
            PK: `USER@${this.appEmail}`,
            SK: `CREATED_TIME@${this.createdTime.valueOf()}#TWITTER_VICTIM@${this.victimId}`,
        }
    }
}

export class User {
    appEmail: string;
    telegramChatId: string;
    subscribeStart: Date;
    subscribeEnd: Date;
    trackCount: number;
    constructor(input: UserInput) {
        this.appEmail = input.appEmail;
        this.telegramChatId = input.telegramChatId;
        // this.subscribeStart = input.subscribeStart || new Date();
        // this.subscribeEnd = input.subscribeEnd || new Date();
        this.trackCount = input.trackCount || 0;
    }

    toORM() {
        return {
            PK: `USER@${this.appEmail}`,
            SK: `METADATA`,
            telegramChatId: this.telegramChatId,
            trackCount: this.trackCount || 0,
            // subscribeStart: this.subscribeStart,
            // subscribeEnd: this.subscribeEnd,
        }
    }

    toAPI() {
        return {
            appEmail: this.appEmail,
            telegramChatId: this.telegramChatId,
            trackCount: this.trackCount,
            // subscribeStart: this.subscribeStart,
            // subscribeEnd: this.subscribeEnd,
        }
    }

    static fromORM(orm): User {
        const appEmail = orm.PK.replace('USER@', '')
        const telegramChatId = orm.telegramChatId
        const trackCount = orm.trackCount
        return new User({
            appEmail,
            telegramChatId,
            trackCount,
        })
    }

    toQueryKey() {
        return {
            PK: `USER@${this.appEmail}`,
            SK: `METADATA`,
        }
    }
}

export class Following {
    public appEmail: string;
    public victimId: string;
    public followingUsername: string;
    public profilePictureUrl: string;
    public updateTime: Date;
    constructor(input: FollowingInput) {
        this.appEmail = input.appEmail;
        this.victimId = input.victimId;
        this.followingUsername = input.followingUsername;
        this.profilePictureUrl = input.profilePictureUrl;
        this.updateTime = input.updateTime || new Date();
    }

    static fromTwitterAPI(appEmail: string, victimId: string, api: TwitterUserItem) {
        const followingUsername = api.legacy.screen_name
        const profilePictureUrl = api.legacy.profile_image_url_https
        return new Following({
            appEmail,
            victimId,
            followingUsername,
            profilePictureUrl,
        })
    }

    toORM() {
        return {
            PK: `TWITTER_VICTIM@${this.victimId}#USER@${this.appEmail}`,
            SK: `UPDATE_TIME@${this.updateTime.valueOf()}#TWITTER_FOLLOWING@${this.followingUsername}`,
            pictureProfileUrl: this.profilePictureUrl,
        }
    }

    toAPI() {
        return {
            userName: this.followingUsername,
            pictureProfileUrl: this.profilePictureUrl,
            updateTime: this.updateTime.valueOf(),
            profileUrl: `https://twitter.com/${this.followingUsername}`,
            id: this.toQueryKey().SK,
        }
    }

    toQueryKey() {
        return {
            PK: `TWITTER_VICTIM@${this.victimId}#USER@${this.appEmail}`,
            SK: `UPDATE_TIME@${this.updateTime.valueOf()}#TWITTER_FOLLOWING@${this.followingUsername}`,
        }
    }

    static fromORM(orm) {
        let [
            victimId,
            appEmail,
        ] = orm.PK.split('#')
        victimId = victimId.replace('TWITTER_VICTIM@', '')
        appEmail = appEmail.replace('USER@', '')
        let [
            updateTime,
            followingUsername,
        ] = orm.SK.split('#')
        updateTime = updateTime.replace('UPDATE_TIME@', '')
        updateTime = Number(updateTime)

        followingUsername = followingUsername.replace('TWITTER_FOLLOWING@', '')
        const profilePictureUrl = orm.pictureProfileUrl

        return new Following({
            appEmail,
            victimId,
            followingUsername,
            profilePictureUrl,
            updateTime,
        })
    }
}
