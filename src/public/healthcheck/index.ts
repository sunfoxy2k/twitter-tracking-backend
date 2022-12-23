import { responseWrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';

const main = async (event: APIGatewayEvent, context: Context) => {
    // get api gateway body
    console.log('====================================');
    console.log('event', event);
    console.log('context', context);
    console.log('====================================');
    return {
        status: 'healthy',
        event,
        context,
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context, authentication: false })
}
