exports.up = knex => knex.schema.createTable('protocol', table =>{
  table.increments()
  table.integer('id_company').notNullable().unsigned()
  table.integer('id_contact').notNullable().unsigned()
  table.boolean('closed').default(false)
  table.timestamps(true, true)
  table.foreign('id_company').references('company.id')
  table.foreign('id_contact').references('contact.id')
})

exports.down = knex => knex.schema.dropTableIfExists('protocol')
