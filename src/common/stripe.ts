
// const STRIPE_PK = 'pk_test_51M5qDgKGvMxyE2EOFnH9APMZRC9GaX8m4VZBVCy81qHGQZQYBds6yaX7X2lUYNlPNEZi9OrefseMUKJsbh4LAEAG00q4BCDe0M'
// const STRIPE_SK = 'sk_test_51M5qDgKGvMxyE2EOgGmUei86DatBApmavgbBJfb2mSnZRF19hqDCTlwAaXgBcs0h5jxDFgd4iv3FiZP4LxSVydpk00N0zAOJbb'
const STRIPE_PK = process.env.STRIPE_PUBLIC_KEY
const STRIPE_SK = process.env.STRIPE_SECRET_KEY
import Stripe from 'stripe';
import { errorLogger, infoLogger } from './logger';

export const stripeClient = new Stripe(STRIPE_SK, {
    apiVersion: '2022-11-15',
})

export const createStripeCheckoutSession = async (appUsername: string, priceId: string, currentUrl: string) => {
    try {
        currentUrl = currentUrl || 'https://example.com'
        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ['card'],
            cancel_url: currentUrl,
            success_url: currentUrl,
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            customer_email: appUsername,
            mode: 'subscription',
        })

        infoLogger('createStripeCheckoutSession', JSON.stringify(session, null, 2))
    
        return session
    } catch (error) {
        errorLogger('createStripeCheckoutSession', error)
    }
}

export const cancelStripeSubscriptionAtEnd = async (appEmail: string) => {
    try {
        // Cancel all subscriptions for a customer immediately by email
        const customers = await stripeClient.customers.list({
            email: appEmail,
        })
        const customer = customers.data[0]
        const subscriptions = await stripeClient.subscriptions.list({
            customer: customer.id,
        })
        const results = await Promise.all(subscriptions.data.map(async (subscription) => {
            return await stripeClient.subscriptions.update(subscription.id, {
                cancel_at_period_end: true,
            })
        }))

        infoLogger('cancelStripeSubscriptionAtEnd', JSON.stringify(results, null, 2))

        return results
    } catch (error) {
        errorLogger('cancelStripeSubscriptionAtEnd', error)
    }
}
