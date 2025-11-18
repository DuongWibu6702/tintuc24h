const newsRouter = require("./news")
const meRouter = require("./admin")
const siteRouter = require("./site")
 
function route(app) {
    app.use('/news', newsRouter)
    app.use('/admin', meRouter)
    app.use('/', siteRouter)
}

module.exports = route