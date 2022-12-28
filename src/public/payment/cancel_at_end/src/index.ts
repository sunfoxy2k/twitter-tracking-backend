import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { createStripeCheckoutSession } from '/opt/nodejs/stripe'
const main: MainFunction = async (event, context, authenticatedUser) => {
    // get api gateway body
    const appEmail = authenticatedUser.email

    // create stripe checkout session
    const session = await createStripeCheckoutSession(appEmail)

    return {
        url: session.url
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context })
}
