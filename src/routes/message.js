const express = require('express')
const MessageController = require('../controllers/MessageController')

const router = express.Router()
const messageController = new MessageController()

router.post('/', (req, res) => messageController.sendMessage(req,res))
router.get('/', (req,res) => messageController.getReportMessages(req,res))
router.post('/multiple', (req,res) =>messageController.sendMultipleMessages(req,res))
router.post('/status', (req,res) => messageController.getStatusMessages(req,res))
module.exports = router
