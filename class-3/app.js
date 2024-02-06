const express = require('express')
const movies = require('./movies.json')
const crypto = require('node:crypto')
const cors = require('cors')
const { validateMovie, validatePartialMovie } = require('./schema/movies')
const app = express()

app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:8000'
    ]

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
      return callback(null, true)
    }

    return callback(new Error('Not Allowed By CORS'))
  }
})) // Middleware for handleling CORS error

app.disable('x-powered-by')

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' })
})

app.get('/movies', (req, res) => {
  const { genre } = req.query

  if (genre) {
    const filteredMovies = movies.filter(movie =>
      movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )

    return res.json(filteredMovies)
  }

  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieId = movies.find(movie => movie.id === id)

  if (movieId) return res.json(movieId)

  res.status(404).json({ message: 'Movie Not Found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ ...result.error })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }

  movies.push(newMovie)

  res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.find(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie Not Found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie Deleted' })
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const result = validatePartialMovie(req.body)
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (!result.success) {
    return res.status(400).json({ ...result.error })
  }

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie Not Found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

// Handleling CORS error
/* app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
    res.send(200)
  }
}) */

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
