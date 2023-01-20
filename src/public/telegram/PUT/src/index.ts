import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { putTelegramChatId } from '/opt/nodejs/database';
const main: MainFunction = async (event, context, authenticatedUser) => {
    const appUsername = authenticatedUser.username
    const { telegramChatId } = JSON.parse(event.body)

    await putTelegramChatId(appUsername, telegramChatId)

    return {
        code: 'SUCCESS',
        message: 'Put telegramChatId success'
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context })
}
