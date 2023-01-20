import { client, TABLE_NAME, EMAIL_GSI } from '../databaseClient';
import { User } from '../entity/User';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';




export const getUserByUsername = async (appUsername: string): Promise<User> => {
    try {
        const result = await client.get({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER@${appUsername}`,
                SK: `METADATA`
            }
        }).promise()

        if (!result.Item) {
            return null
        }
        return User.fromORM(result.Item)
    } catch (error) {
        console.log(error);
        return null
    }
}

export const getUserByEmail = async (email: string): Promise<User> => {
    try {
        const result = await client.query({
            TableName: TABLE_NAME,
            IndexName: EMAIL_GSI,
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email
            }
        }).promise()

        if (!result.Items || result.Items.length === 0) {
            return null
        }

        return User.fromORM(result.Items[0])
    } catch (error) {
        return null
    }
}

export const putTelegramChatId = async (appUsername: string, telegramChatId: string) => {
    try {
        const params: DocumentClient.UpdateItemInput = {
            TableName: TABLE_NAME,
            Key: {
                PK: `USER@${appUsername}`,
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



export const variantUserTrackCount = async (appUsername: string, variant_trackCount: number) => {
    try {
        // set track count and update last updated time
        const params: DocumentClient.UpdateItemInput = {
            TableName: TABLE_NAME,
            Key: {
                PK: `USER@${appUsername}`,
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

export const updateSubscription = async (appUsername: string, startTime: number, endTime: number) => {
    try {
        const params: DocumentClient.UpdateItemInput = {
            TableName: TABLE_NAME,
            Key: {
                PK: `USER@${appUsername}`,
                SK: `METADATA`,
            },
            UpdateExpression: 'SET subscriptionStartTime = :startTime, subscriptionEndTime = :endTime, updateTime = :updateTime',
            ExpressionAttributeValues: {
                ':startTime': startTime,
                ':endTime': endTime,
                ':updateTime': Date.now().valueOf(),
            }
        }
        console.log('=== update database subscription ===')
        console.log({ appUsername })
        console.log({ startTime })
        console.log({ endTime })
        console.log('=== update database subscription ===')
        await client.update(params).promise()
    } catch (error) {
        console.log(error);
    }
}
