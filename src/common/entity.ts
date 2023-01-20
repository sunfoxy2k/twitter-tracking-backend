import { TwitterUserItem } from "./twitter-utils";
export interface VictimInput {
    appUsername: string;
    victimId: string;
    victimUsername: string;
    trackCount: number;
    profilePictureUrl?: string;
    createdTime?: Date;
    updateTime?: Date;
}

export interface UserInput {
    appUsername: string;
    appEmail: string;
    telegramChatId?: string;
    subscribeStart?: Date;
    subscribeEnd?: Date;
    trackCount?: number;
    subscriptionStartTime?: Date;
    subscriptionEndTime?: Date;
}

export interface FollowingInput {
    appUsername: string;
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
    public appUsername: string;
    public victimId: string;
    public victimUsername: string;
    public trackCount: number; 
    public profilePictureUrl: string;
    public victimType: string;
    public createdTime: Date;
    public updateTime: Date;

    constructor(input: VictimInput) {
        super();
        this.appUsername = input.appUsername;
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
            PK: `USER@${this.appUsername}`,
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
        const appUsername = orm.PK.replace('USER@', '')
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
            appUsername,
            victimId,
            victimUsername,
            trackCount,
            profilePictureUrl,
            createdTime,
            updateTime,
        })
    }

    static fromTwitterAPI(appUsername: string, api: TwitterUserItem): Victim {
        const victimId = api.rest_id
        const victimUsername = api.legacy.screen_name
        const trackCount = api.legacy.friends_count || 0
        const profilePictureUrl = api.legacy.profile_image_url_https
        const createdTime = new Date()
        return new Victim({
            appUsername,
            victimId,
            victimUsername,
            trackCount,
            profilePictureUrl,
            createdTime,
        })
    }

    toQueryKey() {
        return {
            PK: `USER@${this.appUsername}`,
            SK: `CREATED_TIME@${this.createdTime.valueOf()}#TWITTER_VICTIM@${this.victimId}`,
        }
    }
}

export class User {
    appUsername: string;
    telegramChatId: string;
    trackCount: number;
    subscriptionStartTime: Date;
    subscriptionEndTime: Date;
    appEmail: string;
    constructor(input: UserInput) {
        this.appUsername = input.appUsername;
        this.telegramChatId = input.telegramChatId || null;
        this.subscriptionStartTime = input.subscriptionStartTime || new Date();
        this.subscriptionEndTime = input.subscriptionEndTime || new Date();
        this.trackCount = input.trackCount || 0;
        this.appEmail = input.appEmail;
    }

    toORM() {
        return {
            PK: `USER@${this.appUsername}`,
            SK: `METADATA`,
            telegramChatId: this.telegramChatId,
            trackCount: this.trackCount || 0,
            subscriptionStartTime: this.subscriptionStartTime,
            subscriptionEndTime: this.subscriptionEndTime,
            appEmail: this.appEmail,
        }
    }

    toAPI() {
        return {
            appUsername: this.appUsername,
            appEmail: this.appEmail,
            telegramChatId: this.telegramChatId,
            trackCount: this.trackCount,
            subscriptionStartTime: this.subscriptionStartTime,
            subscriptionEndTime: this.subscriptionEndTime,
        }
    }

    static fromORM(orm): User {
        const appUsername = orm.PK.replace('USER@', '')
        const telegramChatId = orm.telegramChatId
        const trackCount = orm.trackCount
        const appEmail = orm.appEmail
        
        return new User({
            appUsername,
            telegramChatId,
            trackCount,
            appEmail,
        })
    }

    toQueryKey() {
        return {
            PK: `USER@${this.appUsername}`,
            SK: `METADATA`,
        }
    }
}

export class Following {
    public appUsername: string;
    public victimId: string;
    public followingUsername: string;
    public profilePictureUrl: string;
    public updateTime: Date;
    constructor(input: FollowingInput) {
        this.appUsername = input.appUsername;
        this.victimId = input.victimId;
        this.followingUsername = input.followingUsername;
        this.profilePictureUrl = input.profilePictureUrl;
        this.updateTime = input.updateTime || new Date();
    }

    static fromTwitterAPI(appUsername: string, victimId: string, api: TwitterUserItem) {
        const followingUsername = api.legacy.screen_name
        const profilePictureUrl = api.legacy.profile_image_url_https
        return new Following({
            appUsername,
            victimId,
            followingUsername,
            profilePictureUrl,
        })
    }

    toORM() {
        return {
            PK: `TWITTER_VICTIM@${this.victimId}#USER@${this.appUsername}`,
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
            PK: `TWITTER_VICTIM@${this.victimId}#USER@${this.appUsername}`,
            SK: `UPDATE_TIME@${this.updateTime.valueOf()}#TWITTER_FOLLOWING@${this.followingUsername}`,
        }
    }

    static fromORM(orm) {
        let [
            victimId,
            appUsername,
        ] = orm.PK.split('#')
        victimId = victimId.replace('TWITTER_VICTIM@', '')
        appUsername = appUsername.replace('USER@', '')
        let [
            updateTime,
            followingUsername,
        ] = orm.SK.split('#')
        updateTime = updateTime.replace('UPDATE_TIME@', '')
        updateTime = Number(updateTime)

        followingUsername = followingUsername.replace('TWITTER_FOLLOWING@', '')
        const profilePictureUrl = orm.pictureProfileUrl

        return new Following({
            appUsername,
            victimId,
            followingUsername,
            profilePictureUrl,
            updateTime,
        })
    }
}
