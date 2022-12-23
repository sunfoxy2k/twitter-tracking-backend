import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';

const main: MainFunction = async (event, context, authenticatedUser) => {
    // get api gateway body
    const appEmail = authenticatedUser.username
    
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context })
}
