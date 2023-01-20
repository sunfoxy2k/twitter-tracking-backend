import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { listVictimsByAppUsername } from "/opt/nodejs/database/victim";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { Victim } from "/opt/nodejs/entity/Victim";

const main: MainFunction = async (event, context, authenticatedUser) => {

    const app_user = await listVictimsByAppUsername(authenticatedUser.username);
    const response = {
        "allIds": [],
        "byId": {}
    }
    app_user.Items.forEach((item: Victim) => {
        const query_key = item.toQueryKey().SK;
        response.allIds.push(query_key);
        response.byId[query_key] = item.toAPI();
    })
    return response
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context })
}
