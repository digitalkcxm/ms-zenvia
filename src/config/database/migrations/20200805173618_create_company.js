exports.up = knex => knex.schema.createTable('company', table =>{
  table.increments()
  table.string('name').notNullable()
  table.string('callback').notNullable()
  table.string('token_company').notNullable()
  table.boolean('activated').defaultTo(true)
  table.timestamps(true, true)
  table.unique('name')
  table.unique('token_company')
})

exports.down = knex => knex.schema.dropTableIfExists('company')
