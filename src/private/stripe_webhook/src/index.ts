
import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { stripeClient } from '/opt/nodejs/stripe';
import Stripe from "stripe";
import { updateSubscription } from '/opt/nodejs/database/user';
import { getUserByEmail } from '/opt/nodejs/database/user';
import { infoLogger, errorLogger } from '/opt/nodejs/logger';
const ENDPOINT_SECRET = 'whsec_HF9PFfiHb1Tff3WjXV4rDPq82wumO5Ec'
const STRIPE_UPDATE_SUBSCRIPTION = 'customer.subscription.updated'
const main: MainFunction = async (event, context) => {
    // implement stripe webhook for subscription
    // https://stripe.com/docs/billing/subscriptions/webhooks
    
    const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature']
    let stripeEvent: Stripe.Event
    try {
        stripeEvent = stripeClient.webhooks.constructEvent(event.body, sig, ENDPOINT_SECRET)
        switch (stripeEvent.type) {
            case STRIPE_UPDATE_SUBSCRIPTION: {
                const webhookObject = stripeEvent.data.object as any
                const startTime = webhookObject.current_period_start
                const endTime = webhookObject.current_period_end

                const customerId = webhookObject.customer
                const customer = await stripeClient.customers.retrieve(customerId) as Stripe.Customer
                const customerEmail = customer.email

                const productId = webhookObject.items.data[0].price.product
                const isCancelled = webhookObject.cancel_at_period_end

                const [user, product] = await Promise.all([
                    getUserByEmail(customerEmail),
                    stripeClient.products.retrieve(productId)
                ])

                const productName = product.name

                infoLogger('Stripe Webhook', `Email from Stripe: ${customerEmail}`)

                infoLogger('Stripe Webhook', `Updating subscription for ${user.appUsername} from ${startTime} to ${endTime} at ${new Date().toISOString()}`)

                await updateSubscription(user.appUsername, productName, startTime, endTime, isCancelled)
                break
            }
            default:
                console.log(`Unhandled event type ${stripeEvent.type}`)
                break
        }
        return {
            statusCode: 200,
            sig: sig,
            body: event.body,
        }
    }
    catch (err) {
        errorLogger('Stripe Webhook', err.message)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: err.message,
            }),
            stripeEventData: event.body,
        }
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context, authentication: false })
}
