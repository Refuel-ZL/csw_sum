const count = require("../scripts/count")
const log4util = require("../models/log4js/log_utils")
var moment = require("moment-timezone")

moment.tz.setDefault("Asia/Shanghai")
module.exports = {
    ydaysum: async function() {
        var ips = await count.alarmip()
        if (!ips) return
        var iplist = []
        var vars = []
        ips.forEach(function(item) {
            iplist[item.ip] = item.remark
            vars.push(item.ip)
        })
        var day = moment().subtract(1, "days").format("YYYY-MM-DD 00:00:00")
        var data = await count.daysum(day, vars)
        var maxcount = 3
        data = data.slice(0, maxcount)
        var msg = []
        for (var index = 0; index < data.length; index++) {
            var item = data[index]
            if (item.tally === 0) {
                break
            }
            var val = `${iplist[item.ip]}:\\n\\t\\t\\t\\t\\t\\t\\tping:成功${parseInt(item.num)-parseInt(item.tally)},失败${item.tally},可靠性${item.ratio}`
            msg.push(val)
        }
        if (msg.length > 0) {
            msg.unshift(`${day.substring(0,10)} \\t日统计前${msg.length}如下:\\n`)
        } else {
            msg = `康森韦尔科技园网络状况日统计:${day}网络无任何异常`
        }
        log4util.writeInfo(msg.join(" "))
        msg = `{"groupType":"统计报告","msg":"${msg.join("\\n")}" }`
        await this.submit(msg)
    },
    submit: async function(data) {
        log4util.writeInfo("写入数据库：")
        var res = await count.inset(data)
        log4util.writeInfo(res.rowsAffected.length + " 行受影响")
    }

}