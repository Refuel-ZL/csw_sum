/*
 * @Author: ZhaoLei 
 * @Date: 2017-08-07 14:11:35 
 * @Last Modified by: ZhaoLei
 * @Last Modified time: 2017-08-10 15:39:39
 */
const count = require("../scripts/count")
const log4util = require("../models/log4js/log_utils")
var fsutil = require("../models/fs/util")
const path = require("path")

var moment = require("moment-timezone")

moment.tz.setDefault("Asia/Shanghai")


var cpath = path.join(__dirname, "../config", "config.json")

var sum = {
    /**项目告警统计 */
    ydayprosum: async(t1, t2) => {
        t1 = t1 || moment().format("YYYY-MM-DD HH:mm:ss")
        t2 = t2 || moment(t1).subtract(1, "days").format("YYYY-MM-DD HH:mm:ss")
        var data = await count.proalarmsum(t2, t1)
        var msg = {
            "groupType": "项目统计",
            "start": moment(t2).format("X"),
            "end": moment(t1).format("X"),
            "name": "项目告警汇总",
            "msg": {}
        }
        if (data.code) {
            log4util.writeErr("项目告警统计错误", JSON.stringify(data))
            msg.err = "【错误】：查询结果失败，详情请查看系统日志"
            sum.submit(JSON.stringify(msg))
            return
        }
        msg.msg = data
        await sum.submit(JSON.stringify(msg))
    },
    /**项目平安短信分析 */
    ydaypronormal: async(t1, t2) => {

        t1 = t1 || moment().format("YYYY-MM-DD HH:mm:ss")

        var data_ = {}
        try {
            data_ = JSON.parse(await fsutil.readFileAsync(cpath, "utf-8"))
        } catch (error) {
            data_ = {
                "last_time": "2001-01-01 00:00:00",
                "msg": {
                    sum: 0,
                    add: 0,
                    lack: 0
                },
                "data": {
                    sum: {},
                    add: {},
                    lack: {}
                }

            }
        }
        try {
            t2 = t2 || data_.last_time
            var data = await count.pornormal(t2, t1)
            var msg = {
                "groupType": "平安短信分析",
                "start": moment(t2).format("X"),
                "end": moment(t1).format("X"),
                "name": "平安短信分析",
                "msg": {
                    sum: 0,
                    add: 0,
                    lack: 0
                },
                "data": {
                    sum: {},
                    add: {},
                    lack: {}
                }
            }
            if (data.code) {
                log4util.writeErr("平安短信分析错误", JSON.stringify(data))
                msg.err = "【错误】：查询结果失败，详情请查看系统日志"
                sum.submit(JSON.stringify(msg))
                return
            }

            var prodic = {}
            data.forEach(function(item) {
                prodic[item.smsno] = item.name
            })
            msg.msg.sum = data.length
            msg.data.sum = prodic
            var add = 0
            var lack = 0
            if (data_.data) {
                for (var i in prodic) {
                    if (!data_.data.sum[i]) {
                        add++
                        /**周期内新增项目 */
                        msg.data.add[i] = prodic[i]
                    }
                }
                for (var n in data_.data.sum) {
                    if (!prodic[n]) {
                        /**周期内漏报项目 */
                        lack++
                        msg.data.lack[n] = data_.data.sum[n]
                    }
                }
            }
            msg.msg.add = add
            msg.msg.lack = lack
            data_.last_time = t1
            data_.data = msg.data
            data_.msg = msg.msg
            await fsutil.writeFileAsync(cpath, JSON.stringify(data_))
            sum.submit(JSON.stringify(msg))
        } catch (error) {
            log4util.writeInfo(data_)
            log4util.writeErr(error)
            await fsutil.writeFileAsync(cpath, "")
        }

    },
    submit: async(data) => {
        log4util.writeInfo("写入数据库：" + data)
        var res = await count.inset(data)
        log4util.writeInfo(res.rowsAffected.length + " 行受影响")
    },

}

module.exports = sum