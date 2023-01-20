import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { createStripeCheckoutSession } from '/opt/nodejs/stripe'
const main: MainFunction = async (event, context, authenticatedUser) => {
    const appUsername = authenticatedUser.email
    const { plan } = JSON.parse(event.body)

    const basicPriceId = 'price_1MIu2TKGvMxyE2EOXC6pMMLE'
    const premiumPriceId = 'price_1MKNTpKGvMxyE2EO8OIhP3eW'
    let priceId: string
    
    switch (plan) {
        case 'basic':
            priceId = basicPriceId
            break
        case 'premium':
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
    // create stripe checkout session
    const session = await createStripeCheckoutSession(appUsername, priceId)

    return {
        url: session.url
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context })
}
