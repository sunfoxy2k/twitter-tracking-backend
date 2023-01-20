import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Following } from '../entity/Following';
import { MAX_WRITE_REQUESTS, TABLE_NAME, client } from '../databaseClient';


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

export const listAllFollowingsByVictim = async (appUsername: string, victimId: string)
    : Promise<Following[]> => {
    const params: DocumentClient.QueryInput = {
        TableName: TABLE_NAME,
        KeyConditionExpression: `PK = :pk`,
        ExpressionAttributeValues: {
            ':pk': `TWITTER_VICTIM@${victimId}#USER@${appUsername}`,
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

export const listFollowingsByVictimByUser = async (appUsername: string, victimId: string)
: Promise<{[key: string]: Following}> => {
    try {
        let params: DocumentClient.QueryInput = {
            TableName: TABLE_NAME,
            KeyConditionExpression: `PK = :pk`,
            ExpressionAttributeValues: {
                ':pk': `TWITTER_VICTIM@${victimId}#USER@${appUsername}`,
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
