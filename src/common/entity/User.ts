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
    subscriptionPlan?: string;
    isCancelled?: boolean;
}

export class User extends Entity {
    appUsername: string;
    telegramChatId: string;
    trackCount: number;
    subscriptionStartTime: Date;
    subscriptionEndTime: Date;
    appEmail: string;
    subscriptionPlan: string;
    isCancelled: boolean;
    updatingVictims: number;

    constructor(input: UserInput) {
        super();
        this.appUsername = input.appUsername;
        this.telegramChatId = input.telegramChatId || null;
        this.subscriptionStartTime = input.subscriptionStartTime || null;
        this.subscriptionEndTime = input.subscriptionEndTime || null;
        this.trackCount = input.trackCount || 0;
        this.appEmail = input.appEmail;
        this.subscriptionPlan = input.subscriptionPlan || null;
        this.isCancelled = input.isCancelled || null;
        this.updatingVictims = 0;
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
            subscriptionPlan: this.subscriptionPlan,
            isCancelled: this.isCancelled,
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
            subscriptionPlan: this.subscriptionPlan,
            isCancelled: this.isCancelled,
        }
    }

    static fromORM(orm): User {
        const appUsername = orm.PK.replace('USER@', '')
        const telegramChatId = orm.telegramChatId
        const trackCount = orm.trackCount
        const appEmail = orm.appEmail
        const subscriptionStartTime = orm.subscriptionStartTime
        const subscriptionEndTime = orm.subscriptionEndTime
        const subscriptionPlan = orm.subscriptionPlan
        const isCancelled = orm.isCancelled
        
        
        return new User({
            appUsername,
            telegramChatId,
            trackCount,
            appEmail,
            subscriptionStartTime,
            subscriptionEndTime,
            subscriptionPlan,
            isCancelled,
        })
    }

    toQueryKey() {
        return {
            PK: `USER@${this.appUsername}`,
            SK: `METADATA`,
        }
    }

    getCurrentPlan() {
      if (!this.subscriptionEndTime) return 'Free Plan'
      const now = Date.now()
      let endTime = (this.subscriptionEndTime || new Date(0)).valueOf()

      if (now > endTime) return 'Free Plan'

      return this.subscriptionPlan
    }
}