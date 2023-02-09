import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { createStripeCheckoutSession } from '/opt/nodejs/stripe'
import { getUserByUsername } from '/opt/nodejs/database/user';
const main: MainFunction = async (event, context, authenticatedUser) => {
    const appUsername = authenticatedUser.username
    const { plan, currentUrl } = JSON.parse(event.body)

    const standardPriceId = process.env.STANDARD_PRICE_ID
    const premiumPriceId = process.env.PREMIUM_PRICE_ID
    let priceId: string
    
    switch (plan) {
        case 'Standard':
            priceId = standardPriceId
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
    const session = await createStripeCheckoutSession(user.appEmail, priceId, currentUrl)

    return {
        url: session.url
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context })
}
