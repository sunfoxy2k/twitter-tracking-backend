const entity = require('./entity')
const database = require('./database')
const twitter = require('./twitter_utils')
const telegram = require('./telegram')
const _addZ = (n) => { return n < 10 ? '0' + n : '' + n }


const get_formated_time = (time) => {
    const now = process.env.MOCK_TIME ? parseInt(process.env.MOCK_TIME) : Date.now()
    const Time = time || new Date(now)

    const year = 1900 + Time.getYear()
    const month = _addZ(Time.getMonth())
    const day = _addZ(Time.getDate())
    const hour = _addZ(Time.getHours())
    const min = _addZ(Time.getMinutes())
    const second = _addZ(Time.getSeconds())

    return [year, month, day, hour, min, second].join('_')
}



async function response_wrapper(main, event, context) {
    const response = {
        statusCode: 500,
        headers: {
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*"

        },
        body: "Internal Server Error"
    }

    try {
        const result = await main(event, context)

        response.statusCode = 200;
        response.body = result

    } catch (e) {
        console.error(`ERROR: `, e)
    }

    return response
}

module.exports = {
    get_formated_time,
    response_wrapper,
    database,
    entity,
    twitter,
    telegram,
}