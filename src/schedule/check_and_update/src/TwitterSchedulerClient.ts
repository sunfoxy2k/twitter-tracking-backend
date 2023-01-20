import { User, Victim } from "/opt/nodejs/entity"
import * as database from "/opt/nodejs/database"
import * as twitter from "/opt/nodejs/twitter-utils"
import * as entity from "/opt/nodejs/entity"
import { send_message } from "./telegram"
export class TwitterSchedulerClient {
    public processingVictims: Victim[] = []
    public users: { [key: string]: User } = {}
    async syncUpdateFollowing() {
        for (let victim of this.processingVictims) {
            if (this.users[victim.appUsername] === undefined) {
                this.users[victim.appUsername] = await database.getUserByUsername(victim.appUsername)
            }
            const {
                currentFollowings,
                responseFollowings,
            } = await this.getFollowingsById(victim)
            victim.trackCount = Object.keys(responseFollowings).length

            for (let key of Object.keys(responseFollowings)) {
                // remove existed followings from response and current
                // => what left in responseFollowings are new followings
                // => what left in currentFollowings  are deleted followings
                if (currentFollowings[key] !== undefined) {
                    delete currentFollowings[key]
                    delete responseFollowings[key]
                }
            }
            Promise.all([
                database.putEntity(victim),
                database.batchUpdateFollowing(Object.values(responseFollowings), Object.values(currentFollowings)),
                send_message(this.users[victim.appUsername], victim, responseFollowings, currentFollowings),
            ])
        }
    }

    async getFollowingsById(victim: entity.Victim) {
        try {
            const [
                currentFollowings,
                responseFollowings,
            ] = await Promise.all([
                database.listFollowingsByVictimByUser(victim.appUsername, victim.victimId),
                this.getResponseFollowingsById(victim),
            ])

            return {
                currentFollowings,
                responseFollowings,
            }
        } catch (error) {
            console.log('ERROR update_following_by_id: ', error)
        }
    }

    async getResponseFollowingsById(victim: Victim): Promise<{ [key: string]: entity.Following }> {
        let cursor = '-1'
        let followings: { [key: string]: entity.Following } = {}
        try {
            while (cursor.startsWith('0|') === false) {
                let responseFollowings = await twitter.getFollowingApi(victim.victimId, cursor)
                let parseResponseFollowings = this.parseFollowingsFromApiEntries(victim.appUsername, victim.victimId, responseFollowings)

                followings = { ...followings, ...parseResponseFollowings.followings }
                cursor = parseResponseFollowings.cursorBottom
            }
            return followings
        } catch (error) {
            console.log('ERROR update_following_by_id: ', error)
            Promise.reject(error)
        }
    }

    parseFollowingsFromApiEntries(appUsername: string, victimId: string, responseFollowings)
        : { followings: { [key: string]: entity.Following }, cursorTop: string, cursorBottom: string } {
        const followings: { [key: string]: entity.Following } = {}
        const cursorTop = responseFollowings[responseFollowings.length - 1].content.value as twitter.CursorTop['content']['value']
        responseFollowings.pop()
        const cursorBottom = responseFollowings[responseFollowings.length - 1].content.value as twitter.CursorBottom['content']['value']
        responseFollowings.pop()

        responseFollowings.forEach((following: twitter.FollowingEdge) => {
            const result = following.content.itemContent.user_results.result
            if (result.__typename !== 'UserUnavailable') {
                followings[result.legacy.screen_name] =
                    entity.Following.fromTwitterAPI(appUsername, victimId, result)
            }
        })
        return {
            followings,
            cursorTop,
            cursorBottom,
        }
    }
}
