import { response_wrapper } from "/opt/nodejs/response";
import { client } from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';
import { Victim } from "/opt/nodejs/entity";

const main = async (event: APIGatewayEvent, context: Context) => {
    const all_keys = await client.scan({
        TableName: process.env.TABLE_NAME,
        ProjectionExpression: 'PK, SK',
    }).promise()
    // delete all items
    const all_items = all_keys.Items.map((item) => {
        return {
            DeleteRequest: {
                Key: {
                    PK: item.PK,
                    SK: item.SK
                }
            }
        }
    })
    // split array into chunks of smaller 25 items
    const chunks = []
    for (let i = 0; i < all_items.length; i += 25) {
        chunks.push(all_items.slice(i, i + 25))
    }
    // delete all chunks
    await Promise.all(chunks.map((chunk) => {
        return client.batchWrite({
            RequestItems: {
                [process.env.TABLE_NAME]: chunk
            }
        }).promise()
    }))
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await response_wrapper({ main, event, context })
}