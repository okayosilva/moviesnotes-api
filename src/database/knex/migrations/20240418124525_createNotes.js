
exports.up = knex => knex.schema.createTable('notes', table => {
  table.increments('id').primary()
  table.text('title').notNullable()
  table.text('description').notNullable()

  table.integer('user_id').references('id').inTable('users').notNullable()

  table.timestamp('created_at').defaultTo(knex.fn.now())
  table.timestamp('updated_at').defaultTo(knex.fn.now())
})

exports.down =  knex => knex.schema.dropTable('notes')