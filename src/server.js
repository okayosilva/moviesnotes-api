require('express-async-errors')
const migrationsRun = require('./database/sqlite/migrations')
const AppError = require('./utils/AppError')
const swaggerUi = require('swagger-ui-express')

const express = require('express')
const routes = require('./routes')

const swaggerDocs =  require('./swagger.json')

migrationsRun()

const app = express()
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.use(routes)

app.use((error, request, response, next ) => {
  if(error instanceof AppError) {
    return response.status(error.statusCode).json({ 
      status: 'error', 
      message: error.message
    })
  }
  
  return response.status(500).json({
    status: 'error',
    message: 'Internal Server Error'
  })
})

const PORT = 3333
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`))