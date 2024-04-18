const knex = require("../database/knex")
// const AppError = require("../utils/AppError")

class NotesController {
  async create(request, response) {
    const { title, description, rating, tags, } = request.body
    const { user_id } = request.params

   const [note_id] = await knex("notes").insert({
      title,
      description,
      rating,
      user_id 
    })

    const tagsInsert = tags.map(name => {
      return {
        name,
        user_id,
        note_id,
      }
    })
    await knex("tags").insert(tagsInsert)

    return response.json()
  }

  async delete(request, response) {
    const { id } = request.params

    const note = await knex("notes").where({ id }).delete()

    return response.json()
  }
}

module.exports = NotesController