import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { getUserByUsername } from "/opt/nodejs/database";

const main: MainFunction = async (event, context, authenticatedUser) => {
    // get api gateway body
    const appEmail = authenticatedUser.username
    const user = await getUserByUsername(appEmail)
    return user.toAPI()
}

exports.handler = async (event, context) => {
    return await responseWrapper({ main, event, context })
}
