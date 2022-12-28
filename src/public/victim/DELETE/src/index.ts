import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import * as database from "/opt/nodejs/database";
import { Context, APIGatewayEvent } from 'aws-lambda';
import axios from "axios";

const API_URL = 'https://o764uw297g.execute-api.eu-west-3.amazonaws.com/DEV'

const main: MainFunction = async (event, context, authenticatedUser) => {
    const appEmail = authenticatedUser.username

    const { id } = event.queryStringParameters
    let [
        created_time,
        victimId,
    ] = id.split('#')
    if (created_time === undefined || victimId === undefined) {
        return {
            statusCode: 400,
            code: 'INVALID_ID',
            message: `Invalid id ${id}`
        }
    }
    victimId = victimId.replace('TWITTER_VICTIM@', '')
    const victim = await database.getItemWithKey(`USER@${appEmail}`, id)
    if (!victim) {
        return {
            statusCode: 404,
            code: 'VICTIM_NOT_FOUND',
            message: `Tracker ${id} not found`
        }
    }
    await Promise.all([
        database.deleteItemByKey(`USER@${appEmail}`, id),
        database.variantUserTrackCount(appEmail, -1),
    ])

    await axios.delete(`${API_URL}/private/victim`, {
        data: {
            appEmail,
            victimId: id,
        }
    })

    return {
        code: 'SUCCESS',
        message: 'Delete Tracker Successfully',
    }
}

exports.handler = async (event: APIGatewayEvent, context: Context) => {
    return await responseWrapper({ main, event, context })
}
