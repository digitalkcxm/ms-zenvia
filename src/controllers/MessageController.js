const CompanyModel = require('../models/CompanyModel')
const moment = require('moment')
const MessageModel = require('../models/MessageModel')
const ZenviaService = require('../services/ZenviaService')
const ProtocolModel = require('../models/ProtocolModel')
const StatusMessageModel = require('../models/StatusMessageModel')
const WebHook = require('../helpers/WebHook')
const ContactModel = require('../models/ContactModel')

const companyModel = new CompanyModel()
const messageModel = new MessageModel()
const zenviaService = new ZenviaService()
const protocolModel = new ProtocolModel()
const statusMessageModel = new StatusMessageModel()
const webHook = new WebHook()
const contactModel = new ContactModel()

class MessageController {

  async sendMessage(req, res) {
    req.assert('Authorization', 'O header Authorization é obrigatório.').notEmpty()
    req.assert('msg', 'A propriedade msg é obrigatória.').notEmpty()
    req.assert('id_protocol', 'A propriedade to é obrigatória.').notEmpty()

    if (req.validationErrors())
      return res.status(400).send({ error: req.validationErrors() })

    try {
      const { msg, schedule } = req.body

      const companyToken = await companyModel.getByToken(req.headers.authorization)
      if (companyToken.error)
        return res.status(400).send({ error: companyToken.error })

      if ((msg.length + companyToken[0].name.length) > 159)
        return res.status(400).send({ error: `A mensagem ultrapassa o limite, ${companyToken[0].name}, junto da mensagem ultrapassa 160 caracteres.` })

      const protocol = await protocolModel.getById(req.body.id_protocol)
      if (protocol.error)
        return res.status(400).send({ error: protocol.error })

      const companyProtocol = await companyModel.getById(protocol[0].id_company)

      if (companyToken[0].id != companyProtocol[0].id)
        return res.status(400).send({ error: 'A company atual não é a responsável por este protocolo' })

      if (!companyToken[0].activated)
        return res.status(400).send({ error: 'A company se encontra fechada' })

      const phoneContact = await protocolModel.getPhoneByProtocol(protocol[0].id)
      if (phoneContact.error)
        return res.status(400).send({ error: phoneContact.error })

      const messageId = await messageModel.create(protocol[0].id, companyToken[0].name, schedule, msg, 'Company')
      if (messageId.error)
        return res.status(400).send({ error: messageId.error })

      const resultZenviaSend = await zenviaService.sendMessage(companyToken[0].name, phoneContact[0].phone, false, msg, false, messageId)
      if (resultZenviaSend.error)
        return res.status(400).send({ error: resultZenviaSend.error })

      const statusMessage = await statusMessageModel.create(resultZenviaSend.data, messageId)
      if (statusMessage.error)
        return res.status(400).send({ error: statusMessage.error })
      console.log(`ENVIO DA MSG ==>> ${msg} ==>> para o numero ${phoneContact[0].phone}
      PELA COMPANY ==>> ${companyToken[0].name}`)
      return res.status(200).send({ send: true })
    } catch (error) {
      console.log('ERRO AO ENVIAR MENSAGE ==>> CONTROLLER ==>>', error)
      return res.status(500).send({ error: 'Erro ao enviar a mensagem.' })
    }

  }

  async getZenviaStatus() {
    try {

      const allMessagesWithoutReceived = await messageModel.getMessagesWithoutReceived()

      if (allMessagesWithoutReceived.error)
        return { error: allMessagesWithoutReceived.error }

      let zenviaData, statusUpdate
      allMessagesWithoutReceived.map(async (message) => {
        zenviaData = await zenviaService.getStatusById(message.id)
        if (zenviaData.error)
          return
        statusUpdate = await statusMessageModel.update(zenviaData, message.id)
        if (statusUpdate.error)
          return
      })

    } catch (error) {
      console.log('ERRO AO BUSCAR OS STATUS ZENVIA ==>> CONTROLLER ==>>', error)
    }
  }

  async getNewMessages() {
    try {
      const messages = await zenviaService.getNewMessages()
      let protocol, company, reply

      console.log('MENSAGENS QUE CHEGARAM ==>>', messages)

      if (messages != null) {
        messages.map(async (msg) => {
          protocol = await protocolModel.getProtocolByPhone(msg.mobile)

          if (typeof protocol != 'undefined') {
            company = await protocolModel.getCompany(protocol.id)

            reply = await messageModel.insertReply(protocol.id, company[0].id, msg)

            if (typeof reply != 'undefined') {
              const msgObj = {
                body: msg.body,
                chat: {
                  id: protocol.id
                },
                channel: 'smszv'
              }
              console.log('ENVIAR NO WEBHOOK ==>>', company[0].callback)
              console.log('DADOS             ==>>', msgObj)
              webHook.sendMessage(company[0].callback, msgObj)

            }
          }

        })
      } else {
        console.log('---SEM NOVAS MENSAGENS---')
      }

    } catch (error) {
      console.log('ERRO AO BUSCAR NOVOS SMS NA ZENVIA ==>> CONTROLLER ==>>', error)
    }
  }

  async getReportMessages(req, res) {
    console.log('VAI TRAZER AS MSG')
    req.assert('Authorization', 'O header Authorization é obrigatório.').notEmpty()

    if (req.validationErrors())
      return res.status(400).send({ error: req.validationErrors() })

    try {

      req.query.initDate ? req.query.initDate = moment(req.query.initDate).format('YYYY-MM-DD') : req.query.initDate = '2000-01-01'
      req.query.endDate ? req.query.endDate = moment(req.query.endDate).format('YYYY-MM-DD') : req.query.endDate = moment().format('YYYY-MM-DD')
      req.query.initHour ? req.query.initHour = moment(`2000-01-01T${req.query.initHour}`).format('HH:mm:ss') : req.query.initHour = '00:00:00'
      req.query.endHour ? req.query.endHour = moment(`2000-01-01T${req.query.endHour}`).format('HH:mm:ss') : req.query.endHour = moment().format('HH:mm:ss')

      const messagesInProtocols = await messageModel.getMessages(req.query, req.headers.authorization)

      if (messagesInProtocols.error)
        return res.status(400).send({ error: messagesInProtocols.error })

      return res.status(200).send(messagesInProtocols)
    } catch (error) {
      console.log('ERROS AO FAZER A QUERY ==>>', error)
      return res.status(500).send({ error: 'Erro ao buscar relatório.' })
    }

  }

  async sendMultipleMessages(req, res) {
    console.log('ENVIAR MULTIPLAS MSG')
    let protocols = []
    let arrayMessages = []

    req.assert('Authorization', 'O header Authorization é obrigatório.').notEmpty()
    req.assert('messages', 'A chave messages é obrigatório para multiplos envios.').notEmpty()
    req.assert('messages', 'A chave messages é do tipo array, dentro dela deve conter objetos com, to e msg.').isArray()

    if (req.validationErrors())
      return res.status(400).send({ errors: req.validationErrors() })

    try {

      req.body.messages.map(message => {
        message.to.substr(0, 2) != '55' && (message.to = '55' + message.to)
      })

      const company = await companyModel.getByToken(req.headers.authorization)
      if(company.length == 0)
        return res.status(400).send({ error: 'Não existem uma company para o token informado.' })

      if (!company[0].activated)
        return res.status(400).send({ error: 'A company está desativada.' })


      const messagesToSend = req.body.messages
      let contact, protocol, messageId, resultZenviaSend, statusMessage, schedule

      await Promise.all(messagesToSend.map(async (actualMessage) => {
        contact = await contactModel.createContact(actualMessage.to)
        if (contact.error)
          return res.status(400).send({ error: contact.error })

        protocol = await protocolModel.create(company[0].id, contact)
        if (protocol.error)
          return res.status(400).send({ error: contact.error })

        messageId = await messageModel.create(protocol.id_protocol, company[0].name, schedule, actualMessage.msg, 'Company')
        if (messageId.error)
          return res.status(400).send({ error: messageId.error })

        resultZenviaSend = await zenviaService.sendMessage(company[0].name, actualMessage.to, false, actualMessage.msg, false, messageId)
        if (resultZenviaSend.error)
          return res.status(400).send({ error: resultZenviaSend.error })

        statusMessage = await statusMessageModel.create(resultZenviaSend.data, messageId)
        if (statusMessage.error)
          return res.status(400).send({ error: statusMessage.error })

        protocols.push({ protocol: protocol.id_protocol, to: actualMessage.to })
      }))

      return res.status(201).send(protocols)
    } catch (error) {
      console.log('ERRO NO ENVIO MULTIPLO DE MSG ==>>', error)
      return res.status(500).send({error: 'Houve um erro no servidor.'})
    }
  }
}

module.exports = MessageController
