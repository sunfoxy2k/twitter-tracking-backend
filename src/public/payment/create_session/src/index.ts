import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { createStripeCheckoutSession } from '/opt/nodejs/stripe'
import { getUserByUsername } from '/opt/nodejs/database/user';
const main: MainFunction = async (event, context, authenticatedUser) => {
    const appUsername = authenticatedUser.username
    const { plan } = JSON.parse(event.body)

    const basicPriceId = 'price_1MIu2TKGvMxyE2EOXC6pMMLE'
    const premiumPriceId = 'price_1MKNTpKGvMxyE2EO8OIhP3eW'
    let priceId: string
    
    switch (plan) {
        case 'Standard':
            priceId = basicPriceId
            break
        case 'Premium':
            priceId = premiumPriceId
            break
        default: {
            return {
                statusCode: 400,
                code: 'INVALID_PLAN',
                message: `Invalid plan: ${plan}`
            }
        }
    }

    const user = await getUserByUsername(appUsername)

    // create stripe checkout session
    const session = await createStripeCheckoutSession(user.appEmail, priceId)

    return {
        url: session.url
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context })
}
