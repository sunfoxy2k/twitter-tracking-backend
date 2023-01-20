import { Entity } from './Entity';
import { TwitterUserItem } from '../twitter-utils';
export interface VictimInput {
    appUsername: string;
    victimId: string;
    victimUsername: string;
    trackCount: number;
    profilePictureUrl?: string;
    createdTime?: Date;
    updateTime?: Date;
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