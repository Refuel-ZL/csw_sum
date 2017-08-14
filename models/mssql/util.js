/*
 * @Author: ZhaoLei 
 * @Date: 2017-08-14 14:24:22 
 * @Last Modified by:   ZhaoLei 
 * @Last Modified time: 2017-08-14 14:24:22 
 */

'use strict'

var mssql = require('mssql')
const log4util = require('../log4js/log_utils')

var config = require('./config').config
const Sqlutil = function() {}
Sqlutil.prototype.init = function(server, user, password, database) {
    config.user = user
    config.password = password
    config.server = server
    config.database = database
}

Sqlutil.prototype.query = async function(sql) {
    return new Promise(function(resolve, reject) {
        var connection = null
        try {
            connection = new mssql.ConnectionPool(config, function(err) {
                if (err) {
                    connection.close()
                    reject(err)
                } else {
                    let sqlReq = connection.request()
                    sqlReq.query(sql, function(error, result) {
                        connection.close()
                        if (error) {
                            reject(error)
                        } else {
                            resolve(result)
                        }
                    })
                }
            })
        } catch (error) {
            if (connection) {
                connection.close()
            }
            reject(error)
        }

    })
}


module.exports = Sqlutil