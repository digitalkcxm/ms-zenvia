const express = require('express')
const MessageController = require('../controllers/MessageController')

const router = express.Router()
const messageController = new MessageController()

router.post('/', (req, res) => messageController.sendMessage(req,res))

module.exports = router
