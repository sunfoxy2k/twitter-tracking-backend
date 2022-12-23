
const STRIPE_PK = 'pk_test_51M9UBsAfuivxxM5raiZhu2kdhwOeTAngCYwPLUoabAG2makwQTf6ssNVQWDZmWRrXAOrgGR7iwSfuRNErckfQOLx00Bo5btPwC'
const STRIPE_SK = 'sk_test_51M9UBsAfuivxxM5rdWMDATYdehIPqgZuV5nMQzUh6yzXBVQ9eaFMZBi6RUUcVwFgQq5Eu2HcvqrWzjXJW6XjQo4L00LaR8MYzP'
import Stripe from 'stripe';
const price_id = 'price_1M9mLrAfuivxxM5rPVgzCI5Z'


export const createStripeCheckoutSession = async (appEmail: string) => {
    const stripe = new Stripe(STRIPE_SK, {
        apiVersion: '2022-11-15',
    })
    const session = await stripe.checkout.sessions.create({
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
}