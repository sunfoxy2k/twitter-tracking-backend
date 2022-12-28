import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { User, Victim, Following, Entity } from './entity';
export const client = new DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME
const VICTIM_GSI = 'trackingIndex'
const MAX_WRITE_REQUESTS = 25

export const getUserByUsername = async (appEmail: string): Promise<User> => {
    try {
        const result = await client.get({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER@${appEmail}`,
                SK: `METADATA`
            }
        }).promise()

        return User.fromORM(result.Item)
    } catch (error) {
        return null
    }
}

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

export const batchUpdateFollowing = async (putFollowings: Following[], deleteFollowings: Following[]) => {
    try {
        let requestPromises = []
        for (let idx = 0; idx < putFollowings.length; idx += MAX_WRITE_REQUESTS) {
            const chunk = putFollowings.slice(idx, idx + MAX_WRITE_REQUESTS)
            const params: DocumentClient.BatchWriteItemInput = {
                RequestItems: {
                    [TABLE_NAME]: chunk.map((entity) => ({
                        PutRequest: {
                            Item: entity.toORM(),
                        }
                    }))
                }
            }
            requestPromises.push(new Promise((resolve, reject) => {
                client.batchWrite(params, (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data)
                    }
                })
            }))
        }

        for (let idx = 0; idx < deleteFollowings.length; idx += MAX_WRITE_REQUESTS) {
            const chunk = deleteFollowings.slice(idx, idx + MAX_WRITE_REQUESTS)
            const params: DocumentClient.BatchWriteItemInput = {
                RequestItems: {
                    [TABLE_NAME]: chunk.map((entity) => ({
                        DeleteRequest: {
                            Key: entity.toQueryKey(),
                        }
                    })),
                }
            }
            requestPromises.push(new Promise((resolve, reject) => {
                client.batchWrite(params, (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data)
                    }
                })
            }))
        }

        await Promise.all(requestPromises)
    } catch (error) {
        console.log(error);
    }
}

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

export const listAllFollowingsByVictim = async (appEmail: string, victimId: string)
    : Promise<Following[]> => {
    const params: DocumentClient.QueryInput = {
        TableName: TABLE_NAME,
        KeyConditionExpression: `PK = :pk`,
        ExpressionAttributeValues: {
            ':pk': `TWITTER_VICTIM@${victimId}#USER@${appEmail}`,
        }
    }

    let data = []
    let cursor: string | DocumentClient.QueryInput['ExclusiveStartKey'] = 'dummy'
    while(cursor) {
        const result = await client.query(params).promise()
        result.Items = result.Items.map((item) => Following.fromORM(item));
        data = [ ...data, ...result.Items ]

        cursor = result.LastEvaluatedKey
        params.ExclusiveStartKey = cursor as DocumentClient.QueryInput['ExclusiveStartKey']
    }

    return data
}

export const listVictimsByAppEmail = async (appEmail: string, victimType = 'twitter') => {
    try {
        let params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: `PK = :pk and begins_with(SK, :sk)`,
            ExpressionAttributeValues: {
                ':pk': `USER@${appEmail}`,
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

export const listFollowingsByVictimByUser = async (appEmail: string, victimId: string)
: Promise<{[key: string]: Following}> => {
    try {
        let params: DocumentClient.QueryInput = {
            TableName: TABLE_NAME,
            KeyConditionExpression: `PK = :pk`,
            ExpressionAttributeValues: {
                ':pk': `TWITTER_VICTIM@${victimId}#USER@${appEmail}`,
            }
        }
        const result = await client.query(params).promise()
        let data = {}
        for (let item of result.Items) {
            const following = Following.fromORM(item)
            data[following.followingUsername] = following
        }
        return data
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

export const variantUserTrackCount = async (appEmail: string, variant_trackCount: number) => {
    try {
        // set track count and update last updated time
        const params: DocumentClient.UpdateItemInput = {
            TableName: TABLE_NAME,
            Key: {
                PK: `USER@${appEmail}`,
                SK: `METADATA`,
            },
            UpdateExpression: 'SET trackCount = trackCount + :variant_trackCount, updateTime = :update_time',
            ExpressionAttributeValues: {
                ':variant_trackCount': variant_trackCount,
                ':update_time': Date.now(),
            },
        }
        await client.update(params).promise()
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

export const updateSubscription = async (appEmail: string, startTime: number, endTime: number) => {
    try {
        const params: DocumentClient.UpdateItemInput = {
            TableName: TABLE_NAME,
            Key: {
                PK: `USER@${appEmail}`,
                SK: `METADATA`,
            },
            UpdateExpression: 'SET subscriptionStartTime = :startTime, subscriptionEndTime = :endTime, updateTime = :updateTime',
            ExpressionAttributeValues: {
                ':startTime': startTime,
                ':endTime': endTime,
                ':updateTime': Date.now().valueOf(),
            }
        }
        console.log('update database subscription')
        console.log({ appEmail })
        console.log({ startTime })
        console.log({ endTime })
        console.log('update database subscription')
        await client.update(params).promise()
    } catch (error) {
        console.log(error);
    }
}

export const putTelegramChatId = async (appEmail: string, telegramChatId: string) => {
    try {
        const params: DocumentClient.UpdateItemInput = {
            TableName: TABLE_NAME,
            Key: {
                PK: `USER@${appEmail}`,
                SK: `METADATA`,
            },
            UpdateExpression: 'SET telegramChatId = :telegramChatId, updateTime = :updateTime',
            ExpressionAttributeValues: {
                ':telegramChatId': telegramChatId,
                ':updateTime': Date.now().valueOf(),
            }
        }

        await client.update(params).promise()
    } catch (error) {
        console.log(error);
    }
}