require('dotenv').config()

const conn = {
  host     : process.env.DB_HOST_TEST,
  user     : process.env.DB_USERNAME_TEST,
  password : process.env.DB_PASSWORD_TEST,
  database : 'postgres',
  charset  : 'utf8'
}

console.log('USER ==>>',  process.env.DB_USERNAME_TEST)
console.log('running pretest script...')

let knex = require('knex')({ client: 'postgresql', connection: conn})

knex.raw(`DROP DATABASE IF EXISTS ${process.env.DB_DATABASE_TEST}`)
  .then(function(){
    console.log('older version of testing database destroyed.')
    knex.destroy()

    knex = require('knex')({ client: 'postgresql', connection: conn})
    knex.raw(`CREATE DATABASE ${process.env.DB_DATABASE_TEST} WITH OWNER ${process.env.DB_USERNAME_TEST}`)
    .then(function() {

      console.log('New testing database created.')
      conn.database = process.env.DB_DATABASE_TEST
      const environment = 'testing'

      knex = require('knex')(require('../../knexfile')[environment])

      knex.migrate.latest()
      .then(async function() {
        console.log('Migrations successfully created.')
        knex.destroy()
        process.exit()
      })

    })
})
