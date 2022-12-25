
const STRIPE_PK = 'pk_test_51M5qDgKGvMxyE2EOFnH9APMZRC9GaX8m4VZBVCy81qHGQZQYBds6yaX7X2lUYNlPNEZi9OrefseMUKJsbh4LAEAG00q4BCDe0M'
const STRIPE_SK = 'sk_test_51M5qDgKGvMxyE2EOgGmUei86DatBApmavgbBJfb2mSnZRF19hqDCTlwAaXgBcs0h5jxDFgd4iv3FiZP4LxSVydpk00N0zAOJbb'
import Stripe from 'stripe';
const price_id = 'price_1MIu2TKGvMxyE2EOXC6pMMLE'

export const stripeClient = new Stripe(STRIPE_SK, {
    apiVersion: '2022-11-15',
})

export const createStripeCheckoutSession = async (appEmail: string) => {
    try {
        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ['card'],
            cancel_url: 'https://example.com/cancel',
            success_url: 'https://example.com/success',
            line_items: [{
                price: price_id,
                quantity: 1,
            }],
            customer_email: appEmail,
            mode: 'subscription',
        })
    
        return session
    } catch (error) {
        console.log(error)
    }
}