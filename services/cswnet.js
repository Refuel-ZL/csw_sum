const count = require('../scripts/count')
const log4util = require('../models/log4js/log_utils')
var moment = require('moment-timezone')

moment.tz.setDefault('Asia/Shanghai')
var csw = {
    ydaysum: async function(t1, t2) { //t1>t2
        try {
            var _msg = ''
            var ips = (await count.alarmip()).recordset
            var iplist = []
            var vars = []
            if (!ips || ips == null || ips.length < 1) {
                vars = null
            } else {
                ips.forEach(function(item) {
                    iplist[item.ip] = item.remark
                    vars.push(item.ip)
                })
            }
            t1 = t1 || moment().format('YYYY-MM-DD HH:mm:ss')
            t2 = t2 || moment(t1).subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss')
            var data = (await count.daysum(t2, t1, vars)).recordset
            var msg = []
            if (data) {
                var maxcount = 3
                data = data.slice(0, maxcount)
                for (var index = 0; index < data.length; index++) {
                    var item = data[index]
                    if (item.tally === 0) {
                        break
                    }
                    var val = `${iplist[item.ip]}:【${parseInt(item.num)-parseInt(item.tally)}】【${item.tally}】【${item.ratio}】`
                    msg.push(val)
                }
                msg.unshift(`${t2}~${t1}\n网络ping统计前${msg.length}如下:【成功|失败|可靠率】`)
                _msg = {
                    'groupType': '统计报告',
                    'msg': `${msg.join('\n')}`
                }
            } else {
                _msg = {
                    'groupType': '统计报告',
                    'msg': `康森韦尔科技园网络状况日统计:\\n${t2} ~ ${t1}网络无任何异常`
                }
            }
            csw.submit(JSON.stringify(_msg))
        } catch (error) {
            log4util.writeErr(`${t2} - ${t1} 园区ping查询异常, ${error}`)
        }
    },
    submit: data => {
        count.submit(data)
    }

}
module.exports = csw