const CompanyModel = require('../models/CompanyModel')

const companyModel = new CompanyModel()

class MessageController{

  async sendMessage(req,res){
    console.log('VAI ENVIAR A MSG')

    console.log('AUTHORIZATION =>', req.headers.authorization)

    const teste = await companyModel.getByToken(req.headers.authorization)

    console.log('TESTE =>', teste)
    return res.status(200).send({message:'ok'})
  }

}

module.exports = MessageController