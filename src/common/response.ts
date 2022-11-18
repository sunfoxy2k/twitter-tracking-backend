import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { verifyToken } from './authentication';
export interface ResponseWrapperConfig {
    main: (event: APIGatewayEvent, context: Context) => any;
    event?: APIGatewayEvent;
    context?: Context;
    authentication?: boolean;
    body_data_type?: string;
}

export async function response_wrapper(config: ResponseWrapperConfig)
    : Promise<APIGatewayProxyResult> {
    const response = {
        statusCode: 500,
        headers: {
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Content-Type": "application/json",
        },
        body: "Internal Server Error"
    }

    config.authentication = config.authentication || true
    config.body_data_type = config.body_data_type || 'json'

    // if (config.authentication) {
    //     const token = config.event.headers.Authorization
    //     const user = verifyToken(token)
    //     if (!user) {
    //         response.statusCode = 401
    //         response.body = "Unauthorized"
    //         return response
    //     }
    // }

    try {
        const result = await config.main(config.event, config.context)
        response.statusCode = 200
        if (result) {
            response.statusCode = result.statusCode || 200;
            delete result.statusCode
        }

        switch (config.body_data_type) {
            case 'json':
                response.headers['Content-Type'] = 'application/json'
                response.body = JSON.stringify(result);
                break;
            default:
                response.headers['Content-Type'] = 'application/json'
                response.body = result;
        }
    } catch (e) {
        console.error(`ERROR: `, e)
    }

    return response
}