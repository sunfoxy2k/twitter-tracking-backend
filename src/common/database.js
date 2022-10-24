const { Victim, User, Following } = require('./entity');

const { DocumentClient } = require('aws-sdk').DynamoDB;

const client = new DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME
const VICTIM_GSI = 'trackingIndex'

const get_user_by_username = async (app_username) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            PK: `USER@${app_username}`,
            SK: `METADATA`,
        },
    };
    const result = await client.get(params).promise();
    return User.fromORM(result.Item);
}

const insert_entity = async (entity) => {
    try {
        const params = {
            TableName: TABLE_NAME,
            Item: entity.toORM(),
        };
        const result = await client.put(params).promise();
        return result;
    } catch (error) {
        console.log(error);
    }
}

const batch_update_victims = async (put_victims, delete_victims) => {
    try {
        const params = {
            RequestItems: {
                [TABLE_NAME]: put_victims.map((victim) => ({
                    PutRequest: {
                        Item: victim.toORM(),
                    },
                })),
            },
        };
        const result = await client.batchWrite(params).promise();
        return result;
    } catch (error) {
        console.log(error);
    }
}

const scan_all_victims = async (victim_type = 'twitter') => {
    try {
        let params = {
            TableName: TABLE_NAME,
            IndexName: VICTIM_GSI,
            KeyConditionExpression: 'victimType = :victim_type',
            ExpressionAttributeValues: {
                ':victim_type': victim_type,
            },
        }
        let cursor = 'dummy'
        let result_all = {
            Items: [],
            Count: 0,
            ScannedCount: 0,
        }
        while (cursor) {
            const result = await client.query(params).promise()
            result_all.Items = [...result_all.Items,
                ...result.Items.map((item)=> Victim.fromORM(item))
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

const list_victims_by_app_username = async (app_username, victim_type = 'twitter') => {
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
        result.Items = result.Items.map((item)=> Victim.fromORM(item));
        return result
    } catch (error) {
        console.log(error);
    }
}

const list_followings_by_app_username = async (app_username) => {
    try {
        let params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: `PK = :pk and begins_with(SK, :sk)`,
            ExpressionAttributeValues: {
                ':pk': `USER@${app_username}`,
                ':sk': `UPDATED_TIME@`,
            }
        }
        const result = await client.query(params).promise()
        result.Items = result.Items.map((item)=> Following.fromORM(item));
        return result
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    get_user_by_username,
    insert_entity,
    scan_all_victims,
    batch_update_victims,
    list_victims_by_app_username,
    list_followings_by_app_username,
}
