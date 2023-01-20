import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { getUserByUsername } from "/opt/nodejs/database/user";
import { putEntity } from "/opt/nodejs/database/utils";
import { User } from '/opt/nodejs/entity/User';

const main: MainFunction = async (event, context, authenticatedUser) => {
    // get api gateway body
    const body = JSON.parse(event.body)
    const appEmail = body.appEmail
    const appUsername = authenticatedUser.username
    let user = await getUserByUsername(appUsername)
    if (!user) {
        user = new User({
            appUsername,
            appEmail,
        })
    
        await putEntity(user)
    }

    return user.toAPI()
}

exports.handler = async (event, context) => {
    return await responseWrapper({ main, event, context })
}
