const CompanyModel = require('../models/CompanyModel')
const Moment = require('moment')
const MessageModel = require('../models/MessageModel')
const ZenviaService = require('../services/ZenviaService')
const ContactModel = require('../models/ContactModel')
const ProtocolModel = require('../models/ProtocolModel')

const companyModel = new CompanyModel()
const messageModel = new MessageModel()
const zenviaService = new ZenviaService()
const contactModel = new ContactModel()
const protocolModel = new ProtocolModel()

class MessageController {

  async sendMessage(req, res) {
    req.assert('Authorization', 'O header Authorization é obrigatório.').notEmpty()
    req.assert('msg', 'A propriedade msg é obrigatória.').notEmpty()
    req.assert('id_protocol', 'A propriedade to é obrigatória.').notEmpty()

    if (req.validationErrors())
      return res.status(400).send({ errors: req.validationErrors() })

    try {
      const {msg, schedule} = req.body
      const company = await companyModel.getByToken(req.headers.authorization)

      if (company.error)
        return res.status(400).send({ error: company.error })

      const protocol = await protocolModel.getById(req.body.id_protocol)

      if (!company[0].activated)
        return res.status(400).send({ error: 'A company se encontra fechada' })

      const phoneContact = await protocolModel.getPhoneByProtocol(protocol[0].id)
      if (phoneContact.error)
        return res.status(400).send({ error: phoneContact.error })


      const resultZenviaSend =  await zenviaService.sendMessage(company[0], phoneContact[0].phone, false, msg, false)

      let message
      if (resultZenviaSend)
        message = await messageModel.create(protocol[0].id, company[0].name, schedule, msg, 'Company')


      if (message)
        return res.status(200).send({send: true})

      return res.status(200).send({ message: 'Erro ao enviar a mensagem.' })
    } catch (error) {
      console.log('ERRO AO ENVIAR MENSAGE ==>> CONTROLLER ==>>', error)
      return res.send(400).send('Erro ao enviar a mensagem.')
    }

  }

}

module.exports = MessageController
