exports.up = (knex, Promise) => knex.schema.hasColumn('status_message', 'received').then(exists => {
  if (!exists) {
    return knex.schema.table('status_message', t => t.datetime('received'))
  }
})


exports.down = (knex, Promise) => {
  return knex.schema.alterTable('status_message', table => {
    table.dropColumn('received')
  })
}
