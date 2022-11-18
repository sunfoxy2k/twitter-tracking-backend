import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { User, Victim, Following, Entity } from './entity';
export const client = new DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME
const VICTIM_GSI = 'trackingIndex'
const MAX_WRITE_REQUESTS = 25

export const get_user_by_username = async (app_username: string): Promise<User> => {

    const result = await client.get({
        TableName: TABLE_NAME,
        Key: {
            PK: `USER@${app_username}`,
            SK: `METADATA`
        }
    }).promise()
    return User.fromORM(result.Item)
}

export const put_entity = async (entity: Entity) => {
    try {
        await client.put({
            TableName: TABLE_NAME,
            Item: entity.toORM(),
        }).promise();

    } catch (error) {
        console.log(error);
    }
}

export const batch_update_following = async (put_followings: Following[], delete_followings: Following[]) => {
    try {
        let request_promises = []
        for (let idx = 0; idx < put_followings.length; idx += MAX_WRITE_REQUESTS) {
            const chunk = put_followings.slice(idx, idx + MAX_WRITE_REQUESTS)
            const params: DocumentClient.BatchWriteItemInput = {
                RequestItems: {
                    [TABLE_NAME]: chunk.map((entity) => ({
                        PutRequest: {
                            Item: entity.toORM(),
                        }
                    }))
                }
            }
            request_promises.push(new Promise((resolve, reject) => {
                client.batchWrite(params, (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data)
                    }
                })
            }))
        }

        for (let idx = 0; idx < delete_followings.length; idx += MAX_WRITE_REQUESTS) {
            const chunk = delete_followings.slice(idx, idx + MAX_WRITE_REQUESTS)
            const params: DocumentClient.BatchWriteItemInput = {
                RequestItems: {
                    [TABLE_NAME]: chunk.map((entity) => ({
                        DeleteRequest: {
                            Key: entity.getORMKey(),
                        }
                    })),
                }
            }
            request_promises.push(new Promise((resolve, reject) => {
                client.batchWrite(params, (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data)
                    }
                })
            }))
        }

        await Promise.all(request_promises)
    } catch (error) {
        console.log(error);
    }
}

export const scan_all_victims = async (victim_type = 'twitter') => {
    try {
        let params: DocumentClient.QueryInput = {
            TableName: TABLE_NAME,
            IndexName: VICTIM_GSI,
            KeyConditionExpression: 'victimType = :victim_type',
            ExpressionAttributeValues: {
                ':victim_type': victim_type,
            },
        }
        let cursor: string | DocumentClient.QueryInput['ExclusiveStartKey'] = 'dummy'
        let result_all = {
            Items: [],
            Count: 0,
            ScannedCount: 0,
        }
        while (cursor) {
            const result = await client.query(params).promise()
            result_all.Items = [...result_all.Items,
            ...result.Items.map((item) => Victim.fromORM(item))
            ]
            result_all.Count += result.Count
            result_all.ScannedCount += result.ScannedCount

            cursor = result.LastEvaluatedKey
            params.ExclusiveStartKey = cursor
        }

        return result_all;
    } catch (error) {
        console.log(error);
    }
}

export const scan_victims_with_cursor = async (cursor: string | DocumentClient.QueryInput['ExclusiveStartKey'], victim_type = 'twitter') => {
    try {
        let params: DocumentClient.QueryInput = {
            TableName: TABLE_NAME,
            IndexName: VICTIM_GSI,
            KeyConditionExpression: 'victimType = :victim_type',
            ExpressionAttributeValues: {
                ':victim_type': victim_type,
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

export const list_all_followings_by_victim = async (app_username: string, victim_id: string)
    : Promise<Following[]> => {
    let params: DocumentClient.QueryInput = {
        TableName: TABLE_NAME,
        KeyConditionExpression: `PK = :pk`,
        ExpressionAttributeValues: {
            ':pk': `TWITTER_VICTIM@${victim_id}#USER@${app_username}`,
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

export const list_victims_by_app_username = async (app_username: string, victim_type = 'twitter') => {
    try {
        let params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: `PK = :pk and begins_with(SK, :sk)`,
            ExpressionAttributeValues: {
                ':pk': `USER@${app_username}`,
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

export const list_followings_by_victim_by_user = async (app_username: string, victim_id: string)
: Promise<{[key: string]: Following}> => {
    try {
        let params: DocumentClient.QueryInput = {
            TableName: TABLE_NAME,
            KeyConditionExpression: `PK = :pk`,
            ExpressionAttributeValues: {
                ':pk': `TWITTER_VICTIM@${victim_id}#USER@${app_username}`,
            }
        }
        const result = await client.query(params).promise()
        let data = {}
        for (let item of result.Items) {
            const following = Following.fromORM(item)
            data[following.following_username] = following
        }
        return data
    } catch (error) {
        console.log(error);
    }
}

export const update_user_track_count = async (app_username: string, track_count: number) => {
    try {
        // set track count and update last updated time
        const params: DocumentClient.UpdateItemInput = {
            TableName: TABLE_NAME,
            Key: {
                PK: `USER@${app_username}`,
                SK: `METADATA`,
            },
            UpdateExpression: 'set trackCount = :track_count, updateTime = :update_time',
            ExpressionAttributeValues: {
                ':track_count': track_count,
                ':update_time': Date.now(),
            },
        }
        await client.update(params).promise()
    } catch (error) {
        console.log(error);
    }
}

export const update_victim_track_count = async (victim: Victim, track_count: number) => {
    try {
        // set track count and update last updated time
        const params: DocumentClient.UpdateItemInput = {
            TableName: TABLE_NAME,
            Key: victim.toQueryKey(),
            UpdateExpression: 'set trackCount = :track_count, updateTime = :update_time',
            ExpressionAttributeValues: {
                ':track_count': track_count,
                ':update_time': Date.now(),
            },
        }
        await client.update(params).promise()
    } catch (error) {
        console.log(error);
    }
}
