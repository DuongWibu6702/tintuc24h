const path = require('path')
const express = require('express')
const morgan = require('morgan')
const { engine } = require('express-handlebars')
const app = express()
const route = require('./routes')
const db = require('./config/db')
const methodOverride = require('method-override')
const globalUser = require('./app/middlewares/globalUser')
const session = require('express-session')
const port = 3000

app.use(express.static(path.join(__dirname, 'public')))

// Connect to DB
db.connect()

// HTTP logger
app.use(morgan('combined'))

// EasyMDE
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

// Parse form data
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Method Override
app.use(methodOverride('_method'))


// Session config
app.use(session({
  secret: 'tintuc24h-secret',   // Bạn có thể đổi
  resave: false,
  saveUninitialized: false,
}))

// Template engine
const hbsHelpers = require('./app/helpers/handlebars');

app.engine('hbs', engine({
  extname: '.hbs',
  helpers: hbsHelpers
}));
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'resources', 'views'))

// User
app.use(globalUser);

// Routes init
route(app)

// Start server
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
