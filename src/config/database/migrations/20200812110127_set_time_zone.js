exports.up = knex => knex.raw(`set time zone 'America/Sao_Paulo';`)
exports.down = knex => {}
