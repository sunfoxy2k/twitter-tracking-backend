import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TABLE_NAME, VICTIM_GSI, client } from '../databaseClient';
import { Victim } from '../entity/Victim';

export const scanAllVictims = async (victimType = 'twitter') => {
    try {
        let params: DocumentClient.QueryInput = {
            TableName: TABLE_NAME,
            IndexName: VICTIM_GSI,
            KeyConditionExpression: 'victimType = :victimType',
            ExpressionAttributeValues: {
                ':victimType': victimType,
            },
        }
        let cursor: string | DocumentClient.QueryInput['ExclusiveStartKey'] = 'dummy'
        let resultAll = {
            Items: [],
            Count: 0,
            ScannedCount: 0,
        }
        while (cursor) {
            const result = await client.query(params).promise()
            resultAll.Items = [...resultAll.Items,
            ...result.Items.map((item) => Victim.fromORM(item))
            ]
            resultAll.Count += result.Count
            resultAll.ScannedCount += result.ScannedCount

            cursor = result.LastEvaluatedKey
            params.ExclusiveStartKey = cursor
        }

        return resultAll;
    } catch (error) {
        console.log(error);
    }
}

export const scanVictimsWithCursor = async (cursor: string | DocumentClient.QueryInput['ExclusiveStartKey'], victimType = 'twitter') => {
    try {
        let params: DocumentClient.QueryInput = {
            TableName: TABLE_NAME,
            IndexName: VICTIM_GSI,
            KeyConditionExpression: 'victimType = :victimType',
            ExpressionAttributeValues: {
                ':victimType': victimType,
            },
        }
        if (cursor && cursor !== 'dummy') {
            params.ExclusiveStartKey = cursor as DocumentClient.QueryInput['ExclusiveStartKey']
        }
        const result = await client.query(params).promise()
        result.Items = result.Items.map((item) => Victim.fromORM(item));
        return result
    } catch (error) {
        console.log(error);
    }
}

export const listVictimsByAppUsername = async (appUsername: string, victimType = 'twitter') => {
    try {
        let params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: `PK = :pk and begins_with(SK, :sk)`,
            ExpressionAttributeValues: {
                ':pk': `USER@${appUsername}`,
                ':sk': `CREATED_TIME@`,
            }
        }
        const result = await client.query(params).promise()
        result.Items = result.Items.map((item) => Victim.fromORM(item));
        return {
            Items: result.Items as Victim[],
            Count: result.Count,
        }
    } catch (error) {
        console.log(error);
    }
}


export const updateVictimTrackCount = async (victim: Victim, trackCount: number) => {
    try {
        // set track count and update last updated time
        const params: DocumentClient.UpdateItemInput = {
            TableName: TABLE_NAME,
            Key: victim.toQueryKey(),
            UpdateExpression: 'SET trackCount = :trackCount, updateTime = :update_time',
            ExpressionAttributeValues: {
                ':trackCount': trackCount,
                ':update_time': Date.now(),
            },
        }
        await client.update(params).promise()
    } catch (error) {
        console.log(error);
    }
}
