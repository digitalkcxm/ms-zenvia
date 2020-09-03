
exports.up = knex => {
  let createQuery = 'ALTER TABLE company RENAME COLUMN token_company TO token;'
  return knex.raw(createQuery)
}

exports.down = function (knex, Promise) {
  return knex.schema.hasColumn('company', 'token_company').then(() => {
    knex.schema.table('department', t => t.dropColumn('token_company'))
  })
}
