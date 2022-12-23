import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { JwtPayload } from 'jsonwebtoken';
import { verifyToken, decodeToken } from './authentication';

export type MainFunction = (event: APIGatewayEvent, context: Context, authenticatedUser?: JwtPayload) => any

export interface ResponseWrapperConfig {
    main: MainFunction;
    event?: APIGatewayEvent;
    context?: Context;
    authentication?: boolean;
    bodyDataType?: string;
}


export async function responseWrapper(config: ResponseWrapperConfig)
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

    config.authentication = config.authentication === false ? false : true;
    config.bodyDataType = config.bodyDataType || 'json'
    
    try {
        let authenticatedUser = null
        if (config.authentication) {
            const token = config.event.headers.Authorization || config.event.headers.authorization
            authenticatedUser = decodeToken(token)

            if (!authenticatedUser) {
                response.statusCode = 401
                response.body = "Unauthorized User"
                return response
            }
        }

        const result = await config.main(config.event, config.context, authenticatedUser)
        response.statusCode = 200
        if (result) {
            response.statusCode = result.statusCode || 200;
            delete result.statusCode
        }

        switch (config.bodyDataType) {
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
