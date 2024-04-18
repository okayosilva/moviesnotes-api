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

  async index(request, response) {
    const { title, user_id, tags } = request.query

    let notes

    if(tags) {
      const filterTags = tags.split(",").map(tag => tag.trim())
      console.log(filterTags)
      notes = await knex("tags")
      .select([
        "notes.id",
        "notes.user_id",
        "notes.title",
      ])
      .where("notes.user_id", user_id)
      .whereLike("notes.title", `%${title}%`)
      .whereIn("name", filterTags)
      .innerJoin("notes", "notes.id", "tags.note_id")
      .orderBy("notes.title")

    } else {
      notes = await knex("notes")
      .where({ user_id })
      .whereLike("title", `%${title}%`)
      .orderBy("title")
    }

    const userTags = await knex("tags").where({ user_id })
    const notesWithTags = notes.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id)

      return {
        ...note,
        tags: noteTags
      }
    })

    return response.json(notesWithTags)

  }
}

module.exports = NotesController