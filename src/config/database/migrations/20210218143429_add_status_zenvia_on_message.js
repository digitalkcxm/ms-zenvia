exports.up = function(knex, Promise) {
  return knex.schema.table('message', table => {
    table.string('status_zenvia')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.table('message', table => {
    table.dropColumn('status_zenvia')
  })
}
