exports.up = (knex, Promise) => knex.schema.hasColumn('company', 'zenvia_token').then(exists => {
  if (!exists) {
    return knex.schema.table('company', t => t.string('zenvia_token'))
  }
})

exports.down = (knex, Promise) => {
  return knex.schema.alterTable('company', table => {
    table.dropColumn('zenvia_token')
  })
}
