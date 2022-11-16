import { response_wrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';

const main = async (event: APIGatewayEvent, context: Context) => {
    // get api gateway body
    console.log('====================================');
    console.log('event', event);
    console.log('context', context);
    console.log('====================================');
    return {
        status: 'healthy',
        event: event,
        context: context,
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await response_wrapper(main, event, context)
}
