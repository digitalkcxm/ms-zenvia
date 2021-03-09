module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      host:     process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      user:     process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    },
    pool: {
      min: 0,
      max: 5
    },
    migrations: {
      directory: __dirname + '/src/config/database/migrations'
    },
    seeds: {
      directory: __dirname + '/src/config/database/seeds'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      host:     process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      user:     process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    },
    migrations: {
      directory: __dirname + '/src/config/database/migrations'
    },
    seeds: {
      directory: __dirname + '/src/config/database/seeds'
    }
  },

  testing: {
    client: 'postgresql',
    connection: {
      host:     'localhost',
      database: 'ms_zenvia_testes',
      user:     'postgres',
      password: 'root'
    },
    migrations: {
      directory: __dirname + '/src/config/database/migrations'
    },
    seeds: {
      directory: __dirname + '/src/config/database/seeds'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host:     process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      user:     process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    },
    pool: {
      min: 0,
      max: 5
    },
    migrations: {
      directory: __dirname + '/src/config/database/migrations'
    },
    seeds: {
      directory: __dirname + '/src/config/database/seeds'
    }
  }

};
