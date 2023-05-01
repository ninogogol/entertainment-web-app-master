// Import required modules
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const dotenv = require('dotenv')
const path = require('path')

const USERS_JSON_PATH = path.join(__dirname, 'database', 'users.json')
const SHOWS_DATA_JSON_PATH = path.join(__dirname, 'database', 'data.json')

// Load environment variables
dotenv.config()

// Initialize Express app and secret key
const app = express()
const SECRET_KEY = process.env.SECRET_KEY

// Set up middleware
app.use(express.json())

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'))
})

// Set up static file serving after the login route
app.use('/authenticated', authenticate, express.static(path.join(__dirname, 'public', 'authenticated')))
app.use(express.static(path.join(__dirname, 'public')))

// Handle sign-up requests
app.post('/signup', (req, res) => {
  const { username, password, passwordRepeat } = req.body
  if (password !== passwordRepeat) {
    return res.status(400).json({ message: 'Passwords do not match' })
  }

  const users = require(USERS_JSON_PATH)
  const userExists = users.find(u => u.username === username)
  if (userExists) {
    return res.status(400).json({ message: 'Username already exists' })
  }

  const salt = bcrypt.genSaltSync(10)
  const hashedPassword = bcrypt.hashSync(password, salt)
  const newUser = { username, password: hashedPassword, bookmarks: [] }
  users.push(newUser)
  fs.writeFileSync(USERS_JSON_PATH, JSON.stringify(users, null, 2))
  res.status(201).json({ message: 'User successfully registered' })
})

// Handle login requests
app.post('/login', (req, res) => {
  const { username, password } = req.body
  const users = require(USERS_JSON_PATH)
  const user = users.find(u => u.username === username)
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Incorrect login credentials' })
  }

  const token = jwt.sign({ username: user.username }, SECRET_KEY)
  res.json({ token })
})

// Handle data requests
app.get('/data', authenticate, (req, res) => {
  const data = require(SHOWS_DATA_JSON_PATH)
  const query = req.query.query
  const category = req.query.category
  const bookmarks = req.query.bookmarks === 'true'

  let filteredData = data

  if (category) {
    filteredData = filteredData.filter(item =>
      item.category.toLowerCase() === category.toLowerCase()
    )
  }

  if (query) {
    filteredData = filteredData.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    )
  }

  if (bookmarks) {
    const users = require(USERS_JSON_PATH)
    const user = users.find(u => u.username === req.username)
    filteredData = filteredData.filter(item => user.bookmarks.includes(item.id))
  }

  res.json(filteredData)
})


// Handle bookmark requests
app.post('/bookmark', authenticate, (req, res) => {
    const { id, bookmarked } = req.body
    const users = require(USERS_JSON_PATH)
    const userIndex = users.findIndex(u => u.username === req.username)
    const user = users[userIndex]
  
    if (bookmarked) {
      if (!user.bookmarks.includes(id)) {
        user.bookmarks.push(id)
      }
    } else {
      user.bookmarks = user.bookmarks.filter(bookmarkId => bookmarkId !== id)
    }
  
    users[userIndex] = user
    fs.writeFileSync(USERS_JSON_PATH, JSON.stringify(users, null, 2))
    res.json({ message: 'Bookmark successfully updated' })
})


// Middleware to authenticate user requests
function authenticate(req, res, next) {
  const tokenHeader = req.headers.authorization?.split(' ')[1]
  //für den aufruf statischer dateien aus den authenticated
  const token = tokenHeader ? tokenHeader : req.query.token
  if (!token) {
    return res.redirect('../login.html')
    //return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.username = decoded.username
    next()
  } catch (err) {
    //res.status(401).json({ message: 'Invalid token' })
    res.redirect('../login.html')
  }
}

// Start the server on the specified port
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})