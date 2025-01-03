const express = require('express')
const CompanyController = require('../controllers/CompanyController')

const router = express.Router()
const companyController = new CompanyController()

router.get('/', (req,res) => companyController.getAll(req,res))
router.get('/:id', (req,res) => companyController.getById(req,res))
router.post('/', (req,res) => companyController.create(req,res))
router.put('/', (req,res) => companyController.update(req, res))
router.put('/update/api', (req,res) => companyController.updateApi(req, res))

module.exports = router
