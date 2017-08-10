var project = require("../services/project")

var cswnet = require("../services/cswnet")
module.exports = (router) => {

    router.get("/ydayprosum", async function(ctx) {
        try {
            await project.ydayprosum()
            ctx.body = "ok"
        } catch (error) {
            ctx.body = error
        }

    })

    router.get("/ydaysum", async function(ctx) {
        try {
            await cswnet.ydaysum()
            ctx.body = "ok"
        } catch (error) {
            ctx.body = error
        }

    })

    router.all("/ydaypronormal", async(ctx) => {
        try {
            await project.ydaypronormal()
            ctx.body = "ok"
        } catch (error) {
            ctx.body = error
        }

    })
}