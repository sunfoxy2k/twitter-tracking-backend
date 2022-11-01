const axios = require('axios')


const send_message = async (user, victim, new_followings, deleted_followings) => {
    let new_followings_str = ''
    for (const [key, value] of Object.entries(new_followings)) {
        new_followings_str += `+ @${value.following_username}\n`
    }

    let deleted_followings_str = ''
    for (const [key, value] of Object.entries(deleted_followings)) {
        deleted_followings_str += `- @(${value.following_username})\n`
    }

    const response = await axios.post(`https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
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
    return response
}

module.exports = {
    send_message,
}