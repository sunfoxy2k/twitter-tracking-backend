import { User, Victim } from "/opt/nodejs/entity"
import * as database from "/opt/nodejs/database"
import * as twitter from "/opt/nodejs/twitter-utils"
import * as entity from "/opt/nodejs/entity"
import { send_message } from "./telegram"
export class TwitterSchedulerClient {
    public processing_victims: Victim[] = []
    public users: {[key: string]: User} = {}
    async sync_update_following() {
        for (let victim of this.processing_victims) {
            if (this.users[victim.app_username] === undefined) {
                this.users[victim.app_username] = await database.get_user_by_username(victim.app_username)
            }
            const {
                current_followings,
                response_followings,
            } = await this.get_followings_by_id(victim)
            for (let key of Object.keys(response_followings)) {
                // remove existed followings from response and current
                // => what left in response_followings are new followings
                // => what left in current_followings  are deleted followings
                if (current_followings[key] !== undefined) {
                    delete current_followings[key]
                    delete response_followings[key]
                }
            }
            victim.track_count = await twitter.get_following_count_by_id(victim.victim_id)
            Promise.all([
                database.put_entity(victim),
                database.batch_update_following(Object.values(response_followings), Object.values(current_followings)),
                send_message(this.users[victim.app_username], victim, response_followings, current_followings),
            ])
        }
    }

    async get_followings_by_id(victim: entity.Victim) {
        try {
            const [
                current_followings,
                response_followings,
            ] = await Promise.all([
                database.list_followings_by_victim_by_user(victim.app_username, victim.victim_id),
                this.get_response_followings_by_id(victim),
            ])

            return {
                current_followings,
                response_followings,
            }
        } catch (error) {
            console.log('ERROR update_following_by_id: ', error)
        }
    }

    async get_response_followings_by_id(victim: Victim): Promise<{[key: string]: entity.Following}> {
        let cursor = '-1'
        let followings = {}
        try {
            while (cursor.startsWith('0|') === false) {
                let response_followings = await twitter.get_following_api(victim.victim_id, cursor)
                response_followings = this.parse_followings_from_api_entries(victim.app_username, victim.victim_id, response_followings.entries)

                followings = { ...followings, ...response_followings.followings }
                cursor = response_followings.cursor_bottom
            }
            return followings
        } catch (error) {
            console.log('ERROR update_following_by_id: ', error)
            Promise.reject(error)
        }
    }

    parse_followings_from_api_entries(app_username: string, victim_id: string, response_followings: any)
        : { followings: {[key: string]: entity.Following}, cursor_top: string , cursor_bottom: string } {
        const followings = {}
        const cursor_top = response_followings[response_followings.length - 1].content.value
        response_followings.pop()
        const cursor_bottom = response_followings[response_followings.length - 1].content.value
        response_followings.pop()

        response_followings.forEach((following) => {
            const result = following.content.itemContent.user_results.result
            if (result.__typename !== 'UserUnavailable') {
                followings[result.legacy.screen_name] =
                    entity.Following.fromTwitterAPI(app_username, victim_id, following)
            }
        })
        return {
            followings,
            cursor_top,
            cursor_bottom,
        }
    }
}