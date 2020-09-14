const CronJob = require('cron').CronJob

const MessageController = require('../controllers/MessageController')

const messageController = new MessageController()

const status = new CronJob('0/10 * * * * *', () => {
 messageController.getNewMessages()
 messageController.getZenviaStatus()
}, null, true)
