const knex = require("../database/knex")

class TagsController {
  async index(request, response) {
    const { user_id } = request.params

    const tagsList = await knex("tags").where({ user_id }).orderBy("name")

    return response.json({tagsList})
  }
}

module.exports = TagsController