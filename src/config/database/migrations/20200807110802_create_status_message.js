exports.up = knex => knex.schema.createTable('status_message', table =>{
  table.increments()
  table.integer('id_message').notNullable()
  table.string('status_code')
  table.string('status_description')
  table.string('detail_code')
  table.string('detail_description')
  table.datetime('received')
  table.timestamps(true, true)
  table.foreign('id_message').references('message.id')
})

exports.down = function(knex, Promise) {
  
};
