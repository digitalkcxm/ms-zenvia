module.exports = app =>  {
  app.use('/api/v1/health', require('../routes/health'))
  app.use('/api/v1/company', require('../routes/company'))
  app.use('/api/v1/protocol', require('../routes/protocol'))
  app.use('/api/v1/message', require('../routes/message'))
}