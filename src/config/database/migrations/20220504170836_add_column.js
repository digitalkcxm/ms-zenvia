
exports.up = function(knex) {
    return knex.raw(`ALTER TABLE company ADD account VARCHAR(50) NOT NULL DEFAULT 'TESTE';
    ALTER TABLE company ADD password VARCHAR(150) NOT NULL DEFAULT 'TESTE2';`)
};

exports.down = function(knex) {
  
};
