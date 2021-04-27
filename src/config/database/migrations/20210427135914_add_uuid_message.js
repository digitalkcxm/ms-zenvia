exports.up = function (knex, Promise) {
    return knex.schema.table('message', table => {
        table.uuid('id_plataforma_zenvia')
    })
}

exports.down = function (knex, Promise) {
    return knex.schema.table('message', table => {
        table.uuid('id_plataforma_zenvia')
    })
}
