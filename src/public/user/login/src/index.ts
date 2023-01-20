import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { getUserByUsername, putEntity } from "/opt/nodejs/database";
import { User } from '/opt/nodejs/entity';

const main: MainFunction = async (event, context, authenticatedUser) => {
    // get api gateway body
    const appEmail = authenticatedUser.email
    let user = await getUserByUsername(appEmail)
    if (!user) {
        user = new User({
            appEmail,
        })
    
        await putEntity(user)
    }

    return user.toAPI()
}

exports.handler = async (event, context) => {
    return await responseWrapper({ main, event, context })
}
