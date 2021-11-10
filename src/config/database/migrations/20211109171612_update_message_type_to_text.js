exports.up = function (knex, Promise) {
    return knex.raw(`ALTER TABLE message ALTER COLUMN msg TYPE TEXT;`)
  }
  
  exports.down = function (knex, Promise) {
  }
  