var project = require("../services/project")

var cswnet = require("../services/cswnet")
module.exports = (router) => {

    router.get("/ydayprosum", async function(ctx, next) {
            await project.ydayprosum()
            ctx.body = "ok"
        }),

        router.get("/ydaysum", async function(ctx, next) {
            await cswnet.ydaysum()
            ctx.body = "ok"
        })
}