const path = require('path')
const express = require('express')
const morgan = require('morgan')
const { engine } = require('express-handlebars')
const app = express()
const route = require('./routes')
const db = require('./config/db')
const methodOverride = require('method-override')
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

// Template engine
const hbsHelpers = require('./app/helpers/handlebars');

app.engine('hbs', engine({
  extname: '.hbs',
  helpers: hbsHelpers
}));
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'resources', 'views'))

// Routes init
route(app)

// Start server
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
