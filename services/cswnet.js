const count = require("../scripts/count")
const log4util = require("../models/log4js/log_utils")
var moment = require("moment-timezone")

moment.tz.setDefault("Asia/Shanghai")
var csw = {
    ydaysum: async function(t1, t2) { //t1>t2
        var ips = await count.alarmip()
        if (!ips || ips.code === "ESOCKET") {
            let msg = `{"groupType":"统计报告","msg":"【错误】：未找到配置告警的IP列表(可能是数据库访问失败)"}`
            log4util.writeErr("获取需要告警的IP列表", JSON.stringify(ips))
            await csw.submit(msg)
        } else {
            var iplist = []
            var vars = []
            ips.forEach(function(item) {
                iplist[item.ip] = item.remark
                vars.push(item.ip)
            })
            t1 = t1 || moment().format("YYYY-MM-DD HH:mm:ss")
            t2 = t2 || moment(t1).subtract(1, "days").format("YYYY-MM-DD HH:mm:ss")

            var data = await count.daysum(t2, t1, vars)
            var msg = []
            if (data) {
                if (data.code) {
                    let msg = `{"groupType":"统计报告","msg":"【错误】：数据库访问失败,请查看系统日志"}`
                    log4util.writeErr("获取ping IP 结果失败", JSON.stringify(ips))
                    await csw.submit(msg)
                    return
                }
                var maxcount = 3
                data = data.slice(0, maxcount)

                for (var index = 0; index < data.length; index++) {
                    var item = data[index]
                    if (item.tally === 0) {
                        break
                    }
                    var val = `${iplist[item.ip]}:\\n\\t\\t\\t\\t\\t\\t\\tping:成功${parseInt(item.num)-parseInt(item.tally)},失败${item.tally},可靠性${item.ratio}`
                    msg.push(val)
                }
                msg.unshift(`${t2} ~ ${t1} \\t统计前${msg.length}如下:\\n`)
                msg = `{"groupType":"统计报告","msg":"${msg.join("\\n")}" }`
            } else {
                msg = `{"groupType":"统计报告","msg":"康森韦尔科技园网络状况日统计:\\n${t2} ~ ${t1}网络无任何异常"}`
            }
            await csw.submit(msg)
        }
    },
    submit: async function(data) {
        log4util.writeInfo("写入数据库：" + data)
        var res = await count.inset(data)
        log4util.writeInfo(res.rowsAffected.length + " 行受影响")
    }

}
module.exports = csw