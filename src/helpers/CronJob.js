const CronJob = require('cron').CronJob

const MessageController = require('../controllers/MessageController')
const ZenviaService = require('../services/ZenviaService')

const messageController = new MessageController()
const service = new ZenviaService()

const status = new CronJob('0/5 * * * * *', () => {
  messageController.getNewMessages()
  messageController.getZenviaStatus()
}, null, true)
