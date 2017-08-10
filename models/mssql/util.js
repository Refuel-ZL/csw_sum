"use strict"

const mssql = require("mssql")
const log4util = require("../log4js/log_utils")

const config = require("./config").config
const Sqlutil = function() {
    // this.select()
}
Sqlutil.prototype.select = async function(sql) {
    try {
        let pool = await new mssql.ConnectionPool(config).connect()
        var result = await pool.request().query(sql)
        return result.recordset
    } catch (err) {
        log4util.writeErr(err.message)
        return err
    }


}
Sqlutil.prototype.insert = async function(sql) {
    try {
        let pool = await new mssql.ConnectionPool({
            user: "sa",
            password: "123",
            server: "127.0.0.1", // You can use "localhost\\instance" to connect to named instance 
            database: "zlt-monitors",
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 10000
            }
        }).connect()
        var result = await pool.request().query(sql)
        return result
    } catch (err) {
        log4util.writeErr(err.message)
        return err
    }
}


module.exports = Sqlutil