import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { getUserByUsername, putEntity } from "/opt/nodejs/database";
import { User } from '/opt/nodejs/entity';

const main: MainFunction = async (event, context, authenticatedUser) => {
    // get api gateway body
    const appUsername = authenticatedUser.username
    let user = await getUserByUsername(appUsername)
    if (!user) {
        user = new User({
            appUsername,
        })
    
        await putEntity(user)
    }

    return user.toAPI()
}

exports.handler = async (event, context) => {
    return await responseWrapper({ main, event, context })
}
