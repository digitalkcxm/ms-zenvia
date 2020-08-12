const CronJob = require('cron').CronJob

const MessageController = require('../controllers/MessageController')

const messageController = new MessageController()

const status = new CronJob('0 * * * * *', () => messageController.getZenviaStatus(), null, true)
