import { response_wrapper } from "/opt/nodejs/response";
import { list_victims_by_app_username } from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { Victim } from "/opt/nodejs/entity";

const main = async (event: APIGatewayEvent, context: Context) => {
    // get api gateway body
    // const { id } = event.pathParameters;
    const id = 'tung'

    // return response
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await response_wrapper({ main, event, context })
}
