// Libraries
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
let path = require('path')

// Init App
const app = express()
const port = 3000

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Public Folder
app.use(express.static('./public'))

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// Routes
const upload = require('./routes/upload')
const image = require('./routes/image')
const images = require('./routes/images')

app.use('/upload', upload)
app.use('/image', image)
app.use('/images', images)

// Home Page
app.get('/', (req, res) => res.render('pages/index'))

app.listen(port, () => console.log(`Listening at http://localhost:${port}`))