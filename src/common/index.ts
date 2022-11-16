import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

export async function response_wrapper(main: (event: APIGatewayEvent, context: Context) => any, event: APIGatewayEvent, context: Context, body_data_type = 'json')
    : Promise<APIGatewayProxyResult> {
    const response = {
        statusCode: 500,
        headers: {
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"

        },
        body: "Internal Server Error"
    }

    try {
        const result = await main(event, context)
        
        response.statusCode = result.statusCode || 200;

        switch (body_data_type) {
            case 'json':
                response.headers['Content-Type'] = 'application/json'
                response.body = JSON.stringify(result);
                break;
            default:
                response.headers['Content-Type'] = 'text/plain'
                response.body = result;
        }
    } catch (e) {
        console.error(`ERROR: `, e)
    }

    return response
}