var moment = require("moment-timezone")
const msssql = require("../models/mssql/util")
moment.tz.setDefault("Asia/Shanghai")

var _msssql = new msssql()
exports.daysum = function(day, ips) { //YYYY-MM-DD hh:mm:ss
    day = day || moment().subtract(1, "days").format("YYYY-MM-DD 00:00:00")
    var day_ = moment(day).add(1, "days").subtract(1, "s").format("YYYY-MM-DD HH:mm:ss")
    ips = "'" + ips.join("','") + "'"
    var sql = "SELECT b.ip, isnull(a.tally,0) as tally ,b.num,cast (convert (decimal(9,2),100*(cast(b.num as float) -cast(isnull(a.tally,0) as float) )/cast(b.num as float)) as varchar)+'%' as ratio  FROM" +
        "(select ip,COUNT(1)as tally  FROM PingRecord WHERE recordTime >'" + day + "' AND recordTime<'" + day_ + "' AND  roundTripTime ='-1'  GROUP BY ip) as a " +
        "RIGHT join (select ip,COUNT(1)as num FROM PingRecord WHERE recordTime >'" + day + "' AND recordTime<'" + day_ + "' GROUP BY ip ) as b ON  b.ip=a.ip ORDER BY tally DESC"
    if (ips) {
        sql = "SELECT b.ip, isnull(a.tally,0) as tally ,b.num,cast (convert (decimal(9,2),100*(cast(b.num as float) -cast(isnull(a.tally,0) as float) )/cast(b.num as float)) as varchar)+'%' as ratio  FROM" +
            "(select ip,COUNT(1)as tally  FROM PingRecord WHERE recordTime >'" + day + "' AND recordTime<'" + day_ + "' AND  roundTripTime ='-1' and ip in (" + ips + ")  GROUP BY ip) as a " +
            "RIGHT join (select ip,COUNT(1)as num FROM PingRecord WHERE recordTime >'" + day + "' AND recordTime<'" + day_ + "'and ip in (" + ips + ") GROUP BY ip ) as b ON  b.ip=a.ip ORDER BY tally DESC"
    }
    return _msssql.select(sql)
}
exports.alarmip = function() {
    var sql = "SELECT remark,stuff(left(modified,len(modified)-2),1,10,'') as ip FROM CheckedVar WHERE TYPE=6 and varId in(SELECT nodeID FROM AlarmAssciate WHERE alarmPolicyID=2 )"
    return _msssql.select(sql)
}

exports.inset = function(date) {
    var sql = `INSERT INTO WChart2 (context) VALUES ('${date}')`
    console.log(sql)
    return _msssql.insert(sql)
}

exports.proalarmsum = function(t1, t2) {
    var sql = `SELECT s.sum,isnull(p.projectName,s.smsno) as name,s.smsno
    FROM (SELECT  COUNT(*) as sum,smsno  FROM SmsReciLog  WHERE recordtime >='${t1}' AND recordtime <= '${t2}' AND smscontent NOT like '%监测情况%' AND smscontent NOT LIKE '%监控系统查询%'  AND smscontent NOT LIKE '%(_/_)%'
    GROUP BY smsno) as s
    LEFT JOIN ProjectNo as p
    ON s.smsno=p.smsno
    ORDER BY s.sum DESC`
    return _msssql.select(sql)
}