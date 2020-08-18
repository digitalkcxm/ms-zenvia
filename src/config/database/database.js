const environment = process.env.NODE_ENV ? process.env.NODE_ENV : process.env.STATE_ENV
const knex = require('knex')(require('../../../knexfile')[environment])

module.exports = knex
