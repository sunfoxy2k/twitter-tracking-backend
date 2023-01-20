import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { getUserByUsername } from "/opt/nodejs/database/user";

const main: MainFunction = async (event, context, authenticatedUser) => {
    // get api gateway body
    const appUsername = authenticatedUser.username
    const user = await getUserByUsername(appUsername)
    if (!user) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: 'User not found',
            }),
        }
    }
    return user.toAPI()
}

exports.handler = async (event, context) => {
    return await responseWrapper({ main, event, context })
}
