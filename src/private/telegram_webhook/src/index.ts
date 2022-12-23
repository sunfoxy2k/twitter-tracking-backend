import { responseWrapper } from "/opt/nodejs/response";
import axios from "axios";
import { Context, APIGatewayEvent } from 'aws-lambda';

const main = async (event: APIGatewayEvent, context: Context) => {
    const body = JSON.parse(event.body)
    const { message } = body
    const chat_id = message.chat.id
    if (message.text === '/start') {
        await send_message(chat_id, 'Hello, I am a Twitter Tracking bot, please copy Chat ID below to our website to start receiving updated information')
        await send_message(chat_id, chat_id)
    }
    return {
        code: 'SUCCESS',
    }
}

// const html_form = `
//     <form action="https://google.com.vn" method="POST">
//         <label for="email">Email:</label><br>
//         <input type="text" name="email" placeholder"Enter Your Email"/>
//     </form>
// `

const send_message = async (chat_id: string, text: string) => {
    const url = `https://api.telegram.org/${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`
    const response = await axios.post(url, {
        // parse_mode: 'HTML',
        chat_id,
        text,
    })
    response.data
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context, authentication: false })
}
