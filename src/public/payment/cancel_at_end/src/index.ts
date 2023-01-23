import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { cancelStripeSubscriptionAtEnd } from '/opt/nodejs/stripe';
import { getUserByUsername } from '/opt/nodejs/database/user';
const main: MainFunction = async (event, context, authenticatedUser) => {
    // get api gateway body
    const appUsername = authenticatedUser.username

    // create stripe checkout session

    const user = await getUserByUsername(appUsername)

    const sessions = await cancelStripeSubscriptionAtEnd(user.appEmail)

    return {
        code: 'CANCEL_SUCCESS',
        message: `Subscription cancelled successfully for ${user.appUsername} at ${new Date().toISOString()}`,
        sessionIds: sessions.map(session => session.id)
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context })
}
