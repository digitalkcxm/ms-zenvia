exports.up = knex => knex.schema.createTable('message', table =>{
  table.increments()
  table.integer('id_protocol').notNullable().unsigned()
  table.string('from')
  table.datetime('schedule')
  table.string('msg')
  table.string('source')
  table.string('mobile')
  table.string('mobile_operator_name')
  table.string('callack_option').default('https://mszenvia.digitalk.com.br/api/v1/incoming/status')
  table.boolean('flash_sms').default(false)
  table.timestamps(true, true)
})

exports.down = function(knex, Promise) {
  
};
