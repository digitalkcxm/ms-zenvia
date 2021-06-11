const CronJob = require('cron').CronJob

const MessageController = require('../controllers/MessageController')

const messageController = new MessageController()

const getNewMessages = new CronJob('2 * * * * *', () => {
    messageController.getNewMessages()
   }, null, true)
   
   const getStatus = new CronJob('* 5 * * * *', () => {
       messageController.getZenviaStatus()
   }, null, true)
      