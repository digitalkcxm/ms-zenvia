const ProtocolModel = require('../models/ProtocolModel')
const CompanyModel = require('../models/CompanyModel')
const ContactModel = require('../models/ContactModel')
const ZenviaService = require('../services/ZenviaService')
const MessageModel = require('../models/MessageModel')
const StatusMessageModel = require('../models/StatusMessageModel')

const protocolModel = new ProtocolModel()
const companyModel = new CompanyModel()
const contactModel = new ContactModel()
const zenviaService = new ZenviaService()
const messageModel = new MessageModel()
const statusMessageModel = new StatusMessageModel()

class ProtocolController {

  async createProtocol(req, res) {
    req.assert('to', 'A propriedade to é obrigatória.').notEmpty()
    req.assert('msg', 'A propriedade msg é obrigatória.').notEmpty()
    req.assert('Authorization', 'O header Authorization é obrigatório.').notEmpty()

    if (req.validationErrors())
      return res.status(400).send({ errors: req.validationErrors() })

    try {
      const company = await companyModel.getByToken(req.headers.authorization)
      console.log('COMPANY ', company[0], ' TENTANDO CRIAR PROTOCOLO')
      if (!company[0].activated)
        return res.status(400).send({ error: 'A company está desativada.' })

      if (company[0].id) {
        let { msg, to } = req.body

        if (to.substr(0, 2) != '55')
          to = '55' + to

        if (msg.length > 160)
          return res.status(400).send({ error: 'O texto da mensagem deve ser menor que 160 caracteres' })

        const contact = await contactModel.createContact(to)
        if (contact.error)
          return res.status(400).send({ error: contact.error })

        const protocol = await protocolModel.create(company[0].id, contact)
        if (protocol.error)
          return res.status(400).send({ error: protocol.error })

        const messageId = await messageModel.create(protocol.id_protocol, msg, 'Company')
        if (messageId.error)
          return res.status(400).send({ error: messageId.error })
        console.log('MESSAGE ID ==>>', messageId)
        const resultZenviaSend = await zenviaService.sendMessage(company[0], to, msg, messageId)
        if (resultZenviaSend.error)
          return res.status(400).send({ error: resultZenviaSend.error })

        const statusMessage = await statusMessageModel.create(resultZenviaSend.data, messageId)
        if (statusMessage.error)
          return res.status(400).send({ error: statusMessage.error })
        console.log('CRIACAO DO PROTOCOLO ==>>', { protocol_id: protocol.id_protocol })
        return res.status(201).send({ protocol_id: protocol.id_protocol })
      }
      return res.status(400).send({ error: 'A company não existe' })
    } catch (error) {
      console.log('ERRO AO CRIAR O PROTOCOLO ==>> CONTROLLER ==>>', error)
      return res.status(500).send({ error: 'Erro ao criar o protocolo.' })
    }
  }

  async closeProtocol(req, res) {

    req.assert('Authorization', 'O header Authorization é obrigatório.').notEmpty()
    req.assert('id_protocol', 'O id_protocol é obrigatório.').notEmpty()

    if (req.validationErrors())
      return res.status(400).send({ errors: req.validationErrors() })

    try {
      const id = parseInt(req.body.id_protocol)

      const closedProtocol = await protocolModel.getById(id)

      if (closedProtocol.error)
        return res.status(400).send({ error: closedProtocol.error })

      if (closedProtocol[0].closed)
        return res.status(400).send({ error: 'O protolo já se encontra fechado.' })

      const protocolWillBeClosed = await protocolModel.close(closedProtocol[0].id)
      if (protocolWillBeClosed.error)
        return res.status(400).send({ error: protocolWillBeClosed.error })
      console.log('FECHAMENTO DO PROTOCOLO ==>>', id)
      return res.status(200).send({ message: 'O protocolo foi fechado.' })
    } catch (error) {
      console.log('ERRO AO FECHAR O PROTOCOLO ==>> CONTROLLER ==>>', error)
      return res.status(500).send({ error: 'Erro ao fechar o protocolo.' })
    }
  }
}

module.exports = ProtocolController
