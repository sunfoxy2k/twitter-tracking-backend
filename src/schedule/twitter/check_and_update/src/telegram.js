const axios = require('axios')

const TELEGRAM_BOT_TOKEN = 'bot5665851743:AAFLyINyFjnPRB3Ug_ucHQsfOyGqNbTHo_o'

const send_message = async (user, victim, new_followings, deleted_followings) => {
    let new_followings_str = ''
    for (const [key, value] of Object.entries(new_followings)) {
        new_followings_str += `+ ${value.following_username}\n`
    }

    let deleted_followings_str = ''
    for (const [key, value] of Object.entries(deleted_followings)) {
        deleted_followings_str += `- (${value.following_username})\n`
    }

    const response = await axios.post(`https://api.telegram.org/${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: user.telegram_chat_id,
        text: `
Updated followings from ${victim.victim_username}:
${new_followings_str}

${deleted_followings_str}
        `,
    })
    return response
}

module.exports = {
    send_message,
}