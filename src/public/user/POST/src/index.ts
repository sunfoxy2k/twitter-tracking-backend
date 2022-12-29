import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { User } from '/opt/nodejs/entity';
import { putEntity } from '/opt/nodejs/database';
import { getUserByUsername } from '../../../../common/database';

const main: MainFunction = async (event, context, authenticatedUser) => {
    // get api gateway body
    const appEmail = authenticatedUser.email
    const user = await getUserByUsername(appEmail)
    if (user) {
        return {
            statusCode: 400,
            code: 'USER_EXIST',
            message: 'User already exist'
        }
    }
    const newUser = new User({
        appEmail,
    })

    await putEntity(newUser)

    return {
        code: 'SUCCESS',
        message: 'Add user to db success'
    }
}

exports.handler = async (event, context) => {
    return await responseWrapper({ main, event, context })
}
