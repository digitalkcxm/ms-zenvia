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
      return res.status(400).send({ error: "Ocorreu um erro na seleção das companies." })
    }
  }

  async getById(req, res) {
    try {

      if (!req.params.id || !Number(req.params.id))
        return res.status(400).send({ error: 'Informe um id númerico para a busca' })

      const company = await companyModel.getById(req.params.id)

      if (company.error)
        return res.status(400).send({ error: company.error })

      company.created_at = moment(company.created_at).format('DD/MM/YYYY HH:mm')
      company.updated_at = moment(company.updated_at).format('DD/MM/YYYY HH:mm')

      return res.status(200).send(company)
    } catch (error) {
      console.log('ERRO AO BUSCAR COMPANY => CONTROLLER =>', error)
      return res.status(400).send({ error: "Ocorreu um erro na seleção da company." })
    }
  }

  async create(req, res) {

    req.assert('name', 'A propriedade name é obrigatória.').notEmpty()
    req.assert('callback', 'A propriedade callback é obrigatória.').notEmpty()

    if (req.validationErrors())
      return res.status(400).send({ error: req.validationErrors() })

    try {

      const obj = {}
      const date = moment().format('DD/MM/YYYY HH:mm')

      obj.name = req.body.name
      obj.callback = req.body.callback
      let tokenHash = obj.name + date
      obj.token_company = hash({ foo: tokenHash })
      obj.created_at = date
      obj.updated_at = date

      const nameCompanyExists = await this._getByName(obj.name)

      if(nameCompanyExists.error)
        return res.status(400).send({error : nameCompanyExists.error})

      const companyCreated = await companyModel.create(obj)

      if (companyCreated.error)
        return res.status(400).send({ error: companyCreated.error })

      companyCreated[0].created_at = moment(companyCreated[0].created_at).format('DD/MM/YYYY HH:mm')

      return res.status(200).send(companyCreated[0])

    } catch (error) {
      console.log('ERRO AO CRIAR COMPANY => CONTROLLER =>', error)
      return res.status(400).send({ error: "Ocorreu um erro ao criar a company." })
    }
  }

  async update(req, res) {
    try {

      const obj = {}
      const date = moment().format('DD/MM/YYYY HH:mm')

      req.body.name ? obj.name = req.body.name : ''
      req.body.callback ? obj.callback = req.body.callback : ''
      typeof req.body.activated == 'boolean' ? obj.activated = req.body.activated : ''
      obj.updated_at = date

      const nameCompanyExists = await this._getByName(obj.name)

      if(nameCompanyExists.error)
        return res.status(400).send({error : nameCompanyExists.error})

      let updatedCompany = await companyModel.update(req.params.id, obj)

      if (updatedCompany.error)
        return res.status(400).send({ error: updatedCompany.error })

      updatedCompany[0].updated_at = moment(updatedCompany[0].updated_at).format('DD/MM/YYYY HH:mm')

      return res.status(200).send(updatedCompany[0])
    } catch (error) {
      console.log('ERRO AO ATUALIZAR COMPANY => CONTROLLER =>', error)
      return res.status(400).send({ error: "Ocorreu um erro ao atualizar a company." })
    }
  }

  async _getByName(name) {
    try {

      const nameAlreadyExists = await companyModel.getByName(name)

      if (nameAlreadyExists)
        return { error: 'Já existe uma company com este nome' }

      return
    } catch (error) {
      console.log('ERRO AO BUSCAR O NOME DE UMA COMPANY => CONTROLLER =>', error)
      return res.status(400).send({ error: "Ocorreu um erro ao buscar os nomes da company." })
    }
  }
}

module.exports = CompanyController
