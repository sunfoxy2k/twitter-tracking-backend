import axios from 'axios';
import { User, Following, Victim } from '/opt/nodejs/entity';

export const send_message = async (user: User, victim: Victim, new_followings: { [key: string]: Following }, deleted_followings: { [key: string]: Following }) => {
    try {
        let new_followings_str = ''
        for (const [key, value] of Object.entries(new_followings)) {
            new_followings_str += `+ @${value.following_username}\n`
        }

        let deleted_followings_str = ''
        for (const [key, value] of Object.entries(deleted_followings)) {
            deleted_followings_str += `- @(${value.following_username})\n`
        }
        console.log('====================================');
        console.log('user', user.app_username)
        console.log('victim', victim.victim_username)
        console.log('new_followings_str', new_followings_str);
        console.log('deleted_followings_str', deleted_followings_str);
        console.log('====================================');
        if (new_followings_str.length > 0 || deleted_followings_str.length > 0) {
            const result = await axios.post(`https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: user.telegram_chat_id,
                text: `
        Updated followings from @${victim.victim_username}:
        => Current following count: ${victim.track_count}
        New followings:
        ${new_followings_str}
        Deleted followings:
        ${deleted_followings_str}
        `,
            })
            console.log('sendMessage Result: ',JSON.stringify(result.data), null, 2);
        }
    } catch (error) {
        console.log('====================================');
        console.log('ERROR send_message: ', error);
        console.log('====================================');
    }

}
