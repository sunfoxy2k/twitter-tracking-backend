import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { Context, APIGatewayEvent } from 'aws-lambda';
import axios from "axios";
import { getItemWithKey, deleteItemByKey } from "/opt/nodejs/database/utils";
import { variantUserTrackCount } from "/opt/nodejs/database/user";
const API_URL = 'https://o764uw297g.execute-api.eu-west-3.amazonaws.com/DEV'

const main: MainFunction = async (event, context, authenticatedUser) => {
    const appUsername = authenticatedUser.username

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
    const victim = await getItemWithKey(`USER@${appUsername}`, id)
    if (!victim) {
        return {
            statusCode: 404,
            code: 'VICTIM_NOT_FOUND',
            message: `Tracker ${id} not found`
        }
    }
    await Promise.all([
        deleteItemByKey(`USER@${appUsername}`, id),
        variantUserTrackCount(appUsername, -1),
    ])

    await axios.delete(`${API_URL}/private/victim`, {
        data: {
            appUsername,
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
