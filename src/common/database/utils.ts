import { client, TABLE_NAME } from '../databaseClient';
import { Entity } from '../entity/Entity';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
export const putEntity = async (entity: Entity) => {
    try {
        await client.put({
            TableName: TABLE_NAME,
            Item: entity.toORM(),
        }).promise();

    } catch (error) {
        console.log(error);
    }
}


export const deleteItemByKey = async (pk: string, sk: string) => {
    try {
        const params: DocumentClient.DeleteItemInput = {
            TableName: TABLE_NAME,
            Key: {
                PK: pk,
                SK: sk,
            }
        }
        await client.delete(params).promise()
    } catch (error) {
        console.log(error);
    }
}


export const getItemWithKey = async (pk: string, sk: string) => {
    try {
        const params: DocumentClient.GetItemInput = {
            TableName: TABLE_NAME,
            Key: {
                PK: pk,
                SK: sk,
            }
        }
        const result = await client.get(params).promise()
        return result.Item
    } catch (error) {
        console.log(error);
    }
}