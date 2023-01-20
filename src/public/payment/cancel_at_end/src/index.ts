import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { cancelStripeSubscriptionAtEnd } from '../../../../common/stripe';
const main: MainFunction = async (event, context, authenticatedUser) => {
    // get api gateway body
    const appUsername = authenticatedUser.username

    // create stripe checkout session
    const session = await cancelStripeSubscriptionAtEnd(appUsername)

    return {
        code: 'CANCEL_SUCCESS',
        message: 'Subscription cancelled successfully'
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context })
}
