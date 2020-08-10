exports.up = knex => knex.schema.createTable('contact', table =>{
  table.increments()
  table.string('phone').notNullable()
  table.timestamps(true, true)
})

exports.down = knex => knex.schema.dropTableIfExists('contact')
