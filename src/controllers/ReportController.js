const ReportModel = require('../models/ReportModel')
const CompanyModel = require('../models/CompanyModel')

const reportModel = new ReportModel()
const companyModel = new CompanyModel()

class ReportController{

async listProtocoByStatus(req,res){

  req.assert('Authorization', 'O header Authorization é obrigatório.').notEmpty()
  req.assert('status', 'Envie um status para busca').notEmpty()

  if (req.validationErrors())
    return res.status(400).send({ error: req.validationErrors() })

  try {

    const token = req.headers.authorization
    const company  = await companyModel.getByToken(token)

    if(company.error)
      return res.status(400).send(company)

    const result = await reportModel.listProtocoByStatus(company[0].id, req.body.protocols,req.body.status)

    return res.status(200).send({result})

  } catch (error) {
    console.log('ERRO AO RECUPERAR STATUS ==>>', error)
    return res.status(500).send({error: 'Erro ao recuperar status.'})
  }
}

}

module.exports = ReportController
