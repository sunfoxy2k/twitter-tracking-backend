
import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { stripeClient } from '/opt/nodejs/stripe';
import Stripe from "stripe";
import { updateSubscription } from '/opt/nodejs/database/user';
const ENDPOINT_SECRET = 'whsec_HF9PFfiHb1Tff3WjXV4rDPq82wumO5Ec'

const main: MainFunction = async (event, context) => {
    // implement stripe webhook for subscription
    // https://stripe.com/docs/billing/subscriptions/webhooks
    
    const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature']
    let stripeEvent: Stripe.Event
    try {
        stripeEvent = stripeClient.webhooks.constructEvent(event.body, sig, ENDPOINT_SECRET)
        switch (stripeEvent.type) {
            case 'customer.subscription.updated': {
                const webhookObject = stripeEvent.data.object as any
                const startTime = webhookObject.current_period_start
                const endTime = webhookObject.current_period_end

                const customerId = webhookObject.customer
                const customer = await stripeClient.customers.retrieve(customerId) as Stripe.Customer
                const customerEmail = customer.email

                await updateSubscription(customerEmail, startTime, endTime)
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
        console.log(err)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: err.message,
            }),
        }
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context, authentication: false })
}
