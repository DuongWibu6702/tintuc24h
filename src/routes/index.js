const newsRouter = require("./news")
const authRouter = require('./auth')    
const adminUiRouter = require("./admin")
const siteRouter = require("./site")

function route(app) {
    app.use('/news', newsRouter)
    app.use('/', authRouter)
    app.use('/admin', adminUiRouter)
    app.use('/', siteRouter)
}

module.exports = route;
