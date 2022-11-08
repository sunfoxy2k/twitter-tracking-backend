const { response_wrapper } = require('/opt/nodejs')

const main = async (event, context) => {
    // get api gateway body
    console.log('====================================');
    console.log('event', event);
    console.log('context', context);
    console.log('====================================');
    return {
        status: 'healthy',
        healthcheck: {
            event,
            context,
        }
    }
}

exports.handler = async (event, context) => {
    return await response_wrapper(main)
}
