import { TwitterUserItem } from '../twitter-utils';
export interface FollowingInput {
    appUsername: string;
    victimId: string;
    followingUsername: string;
    profilePictureUrl: string;
    updateTime?: Date;
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
