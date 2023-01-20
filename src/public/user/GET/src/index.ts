import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { getUserByUsername } from "/opt/nodejs/database";

const main: MainFunction = async (event, context, authenticatedUser) => {
    // get api gateway body
    const appUsername = authenticatedUser.username
    const user = await getUserByUsername(appUsername)
    return user.toAPI()
}

exports.handler = async (event, context) => {
    return await responseWrapper({ main, event, context })
}
