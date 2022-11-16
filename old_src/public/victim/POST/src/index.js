const { database, response_wrapper } = require('/opt/nodejs')

const main = async (event, context) => {
    const mock_user = 'tung'
    let mock_victim = 'THESKELETONLOOK'
    mock_victim = 

    return JSON.stringify(victims.Items.map((victim) => victim.toAPI()))
}

exports.handler = async (event, context) => {
    return await response_wrapper(main)
}
