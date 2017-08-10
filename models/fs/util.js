"use strict"

var fs = require("fs")

exports.readFileAsync = function(fpath, encoding) {
    return new Promise(function(resolve, reject) {
        if (fs.existsSync(fpath)) {
            fs.readFile(fpath, encoding, function(err, content) {
                if (err) reject(err)
                else resolve(content)
            })
        } else {
            resolve("没有文件")
        }
    })
}

exports.writeFileAsync = function(fpath, content) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(fpath, content, function(err) {
            if (err) reject(err)
            else resolve()
        })
    })
}