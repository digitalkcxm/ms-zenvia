const elasticAPM = require('./elastic-apm')(process.env.APM_SERVICE_NAME, process.env.APM_SERVER_URL)

const express = require('express')
const validator = require('express-validator')
const bodyParser = require('body-parser')
const cors = require('./cors')
const routes = require('./routes')

const app = express()

cors(app)
app.use(bodyParser.json({limit: '250mb'}))
app.use(bodyParser.urlencoded({limit: '250mb', extended: true}))
app.use(validator())
app.use((req, res, next) => next())

routes(app)

if(process.env.NODE_ENV !== 'testing'){
  app.listen(process.env.PORT, () => console.log(`Server running in port ${ process.env.PORT }`))
}


module.exports = app




