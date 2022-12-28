import { MainFunction, responseWrapper } from "/opt/nodejs/response";
import { User } from '/opt/nodejs/entity';
import { putEntity } from '/opt/nodejs/database';

const main: MainFunction = async (event, context, authenticatedUser) => {
    // get api gateway body
    const appEmail = authenticatedUser.email
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
