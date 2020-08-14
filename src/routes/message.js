const express = require('express')
const MessageController = require('../controllers/MessageController')

const router = express.Router()
const messageController = new MessageController()

router.post('/', (req, res) => messageController.sendMessage(req,res))
router.get('/', (req,res) => messageController.getReportMessages(req,res))

module.exports = router
