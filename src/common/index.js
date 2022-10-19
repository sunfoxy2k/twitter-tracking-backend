const _addZ = (n) => { return n < 10 ? '0' + n : '' + n }

exports.get_formated_time = function get_formated_time  (time) {
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