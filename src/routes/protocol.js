const express = require('express')
const ProtocolController = require('../controllers/ProtocolController')
const { route } = require('./company')

const router = express.Router()
const protocolController = new ProtocolController()

router.post('/', (req, res) => protocolController.createProtocol(req,res))
router.put('/', (req,res) => protocolController.closeProtocol(req,res))
module.exports = router
