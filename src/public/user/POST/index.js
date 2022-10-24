exports.handler = async function (event , context) {
    // TODO implement
    const response = {
        statusCode: 200,
        body: {
            "data": {
                "code": "REGISTER_SUCCESS",
                "message": "Register Success",
            }
        },
    };
    const body = JSON.parse(event.body)
    const { username, password } = body
    const user = await getUserByUsername(username)
    
    return response;
}