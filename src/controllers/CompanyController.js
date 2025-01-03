const moment = require('moment')
const hash = require('object-hash')
const CompanyModel = require('../models/CompanyModel')

const companyModel = new CompanyModel()

class CompanyController {

  async getAll(req, res) {
    try {

      const allCompanies = await companyModel.getAll()

      if (allCompanies.error)
        return res.status(400).send({ error: allCompanies.error })

      allCompanies.map(company => {
        company.created_at = moment(company.created_at).format('DD/MM/YYYY HH:mm')
        company.updated_at = moment(company.updated_at).format('DD/MM/YYYY HH:mm')
      })

      return res.status(200).send(allCompanies)
    } catch (error) {
      console.log('ERRO AO BUSCAR COMPANIES => CONTROLLER =>', error)
      return res.status(500).send({ error: "Ocorreu um erro na seleção das companies." })
    }
  }

  async getById(req, res) {
    try {

      if (!req.params.id || !Number(req.params.id))
        return res.status(400).send({ error: 'Informe um id númerico para a busca' })

      const company = await companyModel.getById(req.params.id)

      if (company.error)
        return res.status(400).send({ error: company.error })

      company[0].created_at = moment(company[0].created_at).format('DD/MM/YYYY HH:mm')
      company[0].updated_at = moment(company[0].updated_at).format('DD/MM/YYYY HH:mm')

      return res.status(200).send(company[0])
    } catch (error) {
      console.log('ERRO AO BUSCAR COMPANY => CONTROLLER =>', error)
      return res.status(500).send({ error: "Ocorreu um erro na seleção da company." })
    }
  }

  async create(req, res) {
    req.assert('name', 'A propriedade name é obrigatória.').notEmpty()
    req.assert('callback', 'A propriedade callback é obrigatória.').notEmpty()
    req.assert('account', 'A propriedade account é obrigatório.').notEmpty()
    req.assert('password', 'A propriedade password é obrigatório.').notEmpty()

    if (req.validationErrors())
      return res.status(400).send({ error: req.validationErrors() })
          
    try {
        
      const obj = {}
      const date = moment().format()
      
      const buff = Buffer.from(`${req.body.account}:${req.body.password}`, 'utf-8')
      const base64 = buff.toString('base64')
      
      obj.name = req.body.name
      obj.callback = req.body.callback
      obj.zenvia_token = `Basic ${base64}`
      if (req.body.aggregated_id) obj.aggregated_id = req.body.aggregated_id
      let tokenHash = obj.name + date
      obj.token = hash({ foo: tokenHash })
      obj.account = req.body.account
      obj.password = req.body.password
      obj.created_at = date
      obj.updated_at = date
      
      const nameAlreadyExists = await companyModel.getByName(obj.name)

      if (nameAlreadyExists[0])
        return res.status(400).send({ error: 'Já existe uma company com este nome' })

      const companyCreated = await companyModel.create(obj)

      if (companyCreated.error)
        return res.status(400).send({ error: companyCreated.error })
      
      companyCreated[0].created_at = moment(companyCreated[0].created_at).format('DD/MM/YYYY HH:mm')
      console.log('CRIAÇÃO DA COMPANY ==>>', companyCreated[0])  
      return res.status(201).send(companyCreated[0])
    } catch (error) {
      console.log('ERRO AO CRIAR COMPANY => CONTROLLER =>', error)
      return res.status(500).send({ error: "Ocorreu um erro ao criar a company." })
    }
  }

  async update(req, res) {

    req.assert('id', 'O parametro de query id é obrigatório').notEmpty()

    if (req.validationErrors())
      return res.status(400).send({ error: req.validationErrors() })


    try {

      const obj = {}
      const date = moment().format()

      const buff = Buffer.from(`${req.body.account}:${req.body.password}`, 'utf-8')
      const base64 = buff.toString('base64')
      
      req.body.name ? obj.name = req.body.name : ''
      req.body.callback ? obj.callback = req.body.callback : ''
      typeof req.body.activated == 'boolean' ? obj.activated = req.body.activated : ''
      obj.updated_at = date
      obj.zenvia_token = `Basic ${base64}`
      obj.account = req.body.account
      obj.password = req.body.password
      obj.aggregated_id = req.body.aggregated_id

      const nameAlreadyExists = await companyModel.getByName(obj.name)
      if (nameAlreadyExists[0] && nameAlreadyExists[0].id != req.body.id)
        return res.status(400).send({ error: 'Já existe uma company com este nome' })

      let updatedCompany = await companyModel.update(req.body.id, obj)

      if (updatedCompany.error)
        return res.status(400).send({ error: updatedCompany.error })

      updatedCompany[0].updated_at = moment(updatedCompany[0].updated_at).format('DD/MM/YYYY HH:mm')
      console.log('ATUALIZAÇÃO DA COMPANY ==>>', updatedCompany[0])

      return res.status(200).send(updatedCompany[0])
    } catch (error) {
      console.log('ERRO AO ATUALIZAR COMPANY => CONTROLLER =>', error)
      return res.status(500).send({ error: "Ocorreu um erro ao atualizar a company." })
    }
  }

  async updateApi(req,res){
    try {

      const {name, token, callback, activated, zenvia_token} = req.body    
      
      const update = {}
      
      zenvia_token ? update.zenvia_token = zenvia_token : ''
      update.name = name
      update.callback = callback  
      update.activated = activated

      const company = await companyModel.getByToken(token)
      if(company.error)
        return res.status(500).send({error:company.error })

      const up = await companyModel.update(company[0].id, update)
      if(up.error)
        return res.status(500).send({error:up.error })

      return res.status(200).send(up)
    } catch (error) {
      console.log('ERRO AO ATUALIZAR COMPANY => CONTROLLER =>', error)
      return res.status(500).send({ error: "Ocorreu um erro ao atualizar a company." })
    }
  }
}

module.exports = CompanyController
