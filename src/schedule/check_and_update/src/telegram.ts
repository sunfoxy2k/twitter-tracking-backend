import axios from 'axios';
import { User, Following, Victim } from '/opt/nodejs/entity';

export const send_message = async (user: User, victim: Victim, newFollowings: { [key: string]: Following }, deletedFollowings: { [key: string]: Following }) => {
    try {
        let newFollowingsStr = ''
        for (const [key, value] of Object.entries(newFollowings)) {
            newFollowingsStr += `+ @${value.followingUsername}\n`
        }

        let deletedFollowingsStr = ''
        for (const [key, value] of Object.entries(deletedFollowings)) {
            deletedFollowingsStr += `- @${value.followingUsername}\n`
        }
        console.log('====================================');
        console.log('user', user.appUsername)
        console.log('victim', victim.victimUsername)
        console.log('newFollowingsStr', newFollowingsStr);
        console.log('deletedFollowingsStr', deletedFollowingsStr);
        console.log('====================================');
        if (newFollowingsStr.length > 0 || deletedFollowingsStr.length > 0) {
            const result = await axios.post(`https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: user.telegramChatId,
                text: `
        Updated followings from @${victim.victimUsername}:
        => Current following count: ${victim.trackCount}
        * New followings:
${newFollowingsStr}
        * Deleted followings:
${deletedFollowingsStr}
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
