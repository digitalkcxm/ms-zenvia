exports.up = (knex, Promise) => knex.schema.hasColumn('company', 'aggregated_id').then(exists => {
  if (!exists) {
    return knex.schema.table('company', t => t.integer('aggregated_id'))
  }
})

exports.down = (knex, Promise) => {
  return knex.schema.alterTable('company', table => {
    table.dropColumn('aggregated_id')
  })
}
