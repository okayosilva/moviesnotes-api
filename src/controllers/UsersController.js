const { hash, compare } = require("bcryptjs")
const sqliteConnection = require("../database/sqlite")
const AppError = require("../utils/AppError")

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body
    const database = await sqliteConnection()
    
    const checkUserExists = await database.get(
      'SELECT * FROM users WHERE email = (?)', [email],
    )
    
    if(checkUserExists) {
      throw new AppError('User email already exists', 400)
    }
    
    const hashedPassword = await hash(password, 8)

    await database.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )
    
    return response.status(201).json()
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body
    const { id }  = request.params

    const database = await sqliteConnection()
    const user = await database.get(
      'SELECT * FROM users WHERE id = (?)', [id]
    )

    if(!user) {
      throw new AppError('User not found', 404)
    }

    const userWithUpdatedEmail = await database.get(
      'SELECT * FROM users WHERE email = (?)'
      , [email])

    if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError('Email already in use', 400)
    }

    user.name = name ?? user.name
    user.email = email ?? user.email

    if(password && !old_password) {
      throw new AppError('Old password is required', 400)
    }

    if(password && old_password) {
       const checkPassword = await compare(old_password, user.password)

        if(!checkPassword) {
          throw new AppError('Old password does not match', 400)
        }

        user.password = await hash(password, 8) 
    }

    await database.run(
      `UPDATE users SET 
       name = ?, 
       email = ?, 
       password = ? ,
       updated_at = DATETIME('now')
       WHERE id = ?`,
      [user.name, user.email, user.password, user.id]
    )

    response.status(204).json()
  }
}

module.exports = UsersController