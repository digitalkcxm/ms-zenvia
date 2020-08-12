
exports.up = knex => knex.schema.alterTable('message', (table) => {
  table.dropColumn('from')
  table.dropColumn('mobile')
  table.dropColumn('callback_option')
  table.dropColumn('flash_sms')
})

exports.down = function (knex, Promise) {

};
