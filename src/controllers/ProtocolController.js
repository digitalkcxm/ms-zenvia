const ProtocolModel = require('../models/ProtocolModel')
const CompanyModel = require('../models/CompanyModel')
const ContactModel = require('../models/ContactModel')

const protocolModel = new ProtocolModel()
const companyModel = new CompanyModel()
const contactModel = new ContactModel()

class ProtocolController{

  async createProtocol(req, res){
    req.assert('to', 'A propriedade to é obrigatória.').notEmpty()
    req.assert('msg', 'A propriedade msg é obrigatória.').notEmpty()
    req.assert('Authorization', 'O header Authorization é obrigatório.').notEmpty()

    const company = await companyModel.getByToken(req.headers.authorization)
    if(company[0].id){
      const contact = await contactModel.createContact(req.body.to)
      if(contact.error)
        return res.status(400).send({error : contact.error})

      const protocol = await protocolModel.create(company.id, contact[0].id)
      return res.status(200).send(protocol)
    }
    return res.status(200).send({error : 'A company não existe'})
  }

  async closeProtocol(req,res){

    req.assert('Authorization', 'O header Authorization é obrigatório.').notEmpty()
    req.assert('id_protocol', 'O id_protocol é obrigatório.').notEmpty()

    try {
      const id = parseInt(req.body.id_protocol)

      const closedProtocol = await protocolModel.getById(id)

      if(closedProtocol.error)
      return res.status(400).send({message : closedProtocol.error})

      if(closedProtocol[0].closed)
        return res.status(400).send({message : 'O protolo já se encontra fechado.'})

      const protocolWillBeClosed = await protocolModel.close(closedProtocol[0].id)

      return res.status(200).send({message : 'O protocolo foi fechado.'})

    } catch (error) {

    }
  }

}

module.exports = ProtocolController
