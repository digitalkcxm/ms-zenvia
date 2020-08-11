exports.up = (knex, Promise) => knex.schema.hasColumn('status_message', 'received').then(exists => {
    if (!exists) {
      return knex.schema.table('status_message', t => t.datetime('received'))
    }
  })


exports.down = function (knex, Promise) {

};
