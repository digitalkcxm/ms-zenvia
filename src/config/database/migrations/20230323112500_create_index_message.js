exports.up =  (knex) => {
    return knex.raw(`CREATE INDEX IF NOT EXISTS idx_message_created_plataforma_source ON message(created_at, id_plataforma_zenvia nulls last, source);`)
}
  
exports.down = function (knex, Promise) {
    return knex.raw(`DROP INDEX IF NOT EXISTS idx_message_created_plataforma_source;`)
}
  