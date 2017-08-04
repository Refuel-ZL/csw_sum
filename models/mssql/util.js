"use strict"

const mssql = require("mssql")

const config = require("./config").config
var pool
const Sqlutil = function() {
    // this.select()
}
Sqlutil.prototype.conpool = async function() {
    if (!pool) {
        pool = await mssql.connect(config)
    }
    return pool
}

Sqlutil.prototype.select = async function(sql) {
    var that = this
    try {
        pool = await that.conpool()
        var result = await pool.request().query(sql)
        return result.recordset
    } catch (err) {
        // throw new Error("SQL Select")
        console.dir(err)
    }

}
Sqlutil.prototype.insert = async function(sql) {
    var that = this
    try {
        pool = await that.conpool()
        var result = pool.request().query(sql)
        return result
    } catch (err) {
        // throw new Error("SQL Select")
        console.dir(err)
    }

}


module.exports = Sqlutil