
exports.up = knex => {
  let createQuery = 'ALTER TABLE company RENAME COLUMN token_company TO token;'
  return knex.raw(createQuery)
}

exports.down = knex => {}
