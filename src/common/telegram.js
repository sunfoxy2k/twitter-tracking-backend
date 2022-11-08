const axios = require('axios')


const send_message = async (chat_id, message) => {
    if (!chat_id) {
        throw new Error('ERROR: chat_id is not defined')
    }
    await axios.post(`https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: user.telegram_chat_id,
        text: message,
    })
}

module.exports = {
    send_message,
}