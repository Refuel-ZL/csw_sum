const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()

const views = require('koa-views')
const co = require('co')
const convert = require('koa-convert')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')

const logUtil = require("./models/log4js/log_utils")
const debug = require('debug')('koa2:server')
const path = require('path')

const config = require('./config')
const routes = require('./routes')

const port = process.env.PORT || config.port

// error handler
onerror(app)

// middlewares
app.use(bodyparser())
    .use(json())
    .use(require('koa-static')(__dirname + '/public'))
    .use(views(path.join(__dirname, '/views'), {
        options: { settings: { views: path.join(__dirname, 'views') } },
        map: { 'ejs': 'ejs' },
        extension: 'ejs'
    }))
    .use(router.routes())
    .use(router.allowedMethods())

// logger
app.use(async(ctx, next) => {
    //响应开始时间
    const start = new Date()

    //响应间隔时间
    var ms
    try {
        //开始进入到下一个中间件
        await next()
        ms = new Date() - start

        //记录响应日志
        // logUtil.logResponse(ctx, ms)
        logUtil.writeInfo(`${ctx.ip} ${ctx.method} ${ctx.url} - ${ms}ms`)
    } catch (error) {
        ms = new Date() - start

        //记录异常日志
        logUtil.logError(ctx, error, ms)
    }
})
router.get('/', async(ctx, next) => {
    // ctx.body = 'Hello World'
    ctx.state = {
        title: 'Koa2'
    }
    await ctx.render('index', ctx.state)
})

routes(router)
app.on('error', function(err, ctx) {
    console.log(err)
    logUtil.logError(ctx, err)
        // logger.error('server error', err, ctx)
})

module.exports = app.listen(config.port, () => {
    console.log(`Listening on http://localhost:${config.port}`)
})