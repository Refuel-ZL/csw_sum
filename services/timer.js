/*
 * @Author: ZhaoLei 
 * @Date: 2017-08-14 15:21:56 
 * @Last Modified by:   ZhaoLei 
 * @Last Modified time: 2017-08-14 15:21:56 
 */
const moment = require('moment-timezone')

moment.tz.setDefault('Asia/Shanghai')

const logUtil = require('../models/log4js/log_utils')

var fsutil = require('../models/fs/util')

var schedule = require('node-schedule')
const path = require('path')

const cswnet = require('./cswnet')
const project = require('./project')
const count = require('../scripts/count')


var cpath = path.join(__dirname, '../config', 'config.json')
module.exports = function() {
    var T1 = schedule.scheduleJob('0 0 17 * * *', async function() {
        var t1 = moment().format('YYYY-MM-DD HH:mm:ss')
        var t2 = ''
        try {
            t2 = JSON.parse(await fsutil.readFileAsync(cpath, 'utf-8')).last_time
        } catch (error) {
            t2 = '2001-01-01 00:00:00'
        }
        project.ydaypronormal(t1, t2)
        project.ydayprosum(t1, t2)
    })

    var T2 = schedule.scheduleJob({ hour: 8, minute: 25 }, function() {
        var t1 = moment().format('YYYY-MM-DD HH:mm:ss')
        var t2 = moment().subtract(1, 'days').format('YYYY-MM-DD 17:10:00')
        cswnet.ydaysum(t1, t2)
    })

    var T3 = schedule.scheduleJob({ hour: 11, minute: 55 }, function() {
        var t1 = moment().format('YYYY-MM-DD HH:mm:ss')
        var t2 = moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss')
        cswnet.ydaysum(t1, t2)
    })

    var T4 = schedule.scheduleJob('0 0 17 * * *', function() {
        var t1 = moment().format('YYYY-MM-DD HH:mm:ss')
        var t2 = moment().format('YYYY-MM-DD 08:30:00')
        cswnet.ydaysum(t1, t2)
    })
}