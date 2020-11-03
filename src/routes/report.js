const express = require('express')
const ReportController = require('../controllers/ReportController')
const { route } = require('./company')

const router = express.Router()
const reportController = new ReportController()

router.post('/', (req, res) => reportController.listProtocoByStatus(req,res))
module.exports = router
