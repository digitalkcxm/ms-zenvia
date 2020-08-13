exports.up = (knex, Promise) => knex.schema.hasColumn('message', 'id_zenvia').then(exists => {
  if (!exists) {
    return knex.schema.table('message', t => t.string('id_zenvia'))
  }
})

exports.down = function (knex, Promise) {

};
