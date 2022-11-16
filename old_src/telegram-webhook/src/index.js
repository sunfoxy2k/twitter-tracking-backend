const { telegram, response_wrapper } = require('/opt/nodejs')

const main = async (event, context) => {
    // get api gateway body
    const body = JSON.parse(event.body)
    await telegram.send_message(5795329653, JSON.stringify(body, null, 4))
    return { status: 'ok' }
}

exports.handler = async (event, context) => {
    return await response_wrapper(main)
}
