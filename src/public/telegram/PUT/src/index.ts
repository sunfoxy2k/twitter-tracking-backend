import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { putTelegramChatId } from '/opt/nodejs/database';
const main: MainFunction = async (event, context, authenticatedUser) => {
    const appEmail = authenticatedUser.email
    const { telegramChatId } = JSON.parse(event.body)

    await putTelegramChatId(appEmail, telegramChatId)

    return {
        code: 'SUCCESS',
        message: 'Put telegramChatId success'
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context })
}
