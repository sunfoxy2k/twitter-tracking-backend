import { Entity } from './Entity';

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

export class User extends Entity {
    appUsername: string;
    telegramChatId: string;
    trackCount: number;
    subscriptionStartTime: Date;
    subscriptionEndTime: Date;
    appEmail: string;
    constructor(input: UserInput) {
        super();
        this.appUsername = input.appUsername;
        this.telegramChatId = input.telegramChatId || null;
        this.subscriptionStartTime = input.subscriptionStartTime || null;
        this.subscriptionEndTime = input.subscriptionEndTime || null;
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