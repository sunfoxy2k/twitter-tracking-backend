import { response_wrapper } from "/opt/nodejs/response";
import { list_victims_by_app_username } from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { Victim } from "/opt/nodejs/entity";

const main = async (event: APIGatewayEvent, context: Context) => {
    // get api gateway body
    // const { id } = event.pathParameters;
    const id = 'tung'
    const app_user = await list_victims_by_app_username(id);
    const response = {
        "allIds": [],
        "byId": {}
    }
    app_user.Items.forEach((item: Victim) => {
        const query_key = item.toQueryKey().SK;
        response.allIds.push(query_key);
        response.byId[query_key] = item;
    })
    return response
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await response_wrapper({ main, event, context })
}
