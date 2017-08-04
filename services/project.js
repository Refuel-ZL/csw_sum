const count = require("../scripts/count")
const log4util = require("../models/log4js/log_utils")
var moment = require("moment-timezone")

moment.tz.setDefault("Asia/Shanghai")

module.exports = {
    ydayprosum: async function() {
        var t1 = moment().subtract(1, "days").format("YYYY-MM-DD 00:00:00")
        var t2 = moment().subtract(1, "days").format("YYYY-MM-DD 23:59:59")
        var data = await count.proalarmsum(t1, t2)
        var msg = `{"groupType":"项目统计" ,"name":"${moment().subtract(1, "days").format("YYYY-MM-DD")} 项目告警汇总","msg":${JSON.stringify(data)} }`
        await this.submit(msg)
    },
    submit: async function(data) {
        log4util.writeInfo("写入数据库：")
        var res = await count.inset(data)
        log4util.writeInfo(res.rowsAffected.length + " 行受影响")
    }
}