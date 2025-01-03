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
      const { msg } = req.body

      const companyToken = await companyModel.getByToken(req.headers.authorization)
      if (companyToken.error)
        return res.status(400).send({ error: companyToken.error })

      //if (msg.length > 159)
      //  return res.status(400).send({ error: 'O texto da mensagem deve ser menor que 160 caracteres' })

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

      const messageId = await messageModel.create(protocol[0].id, msg, 'Company')
      if (messageId.error)
        return res.status(400).send({ error: messageId.error })

      const resultZenviaSend = await zenviaService.sendMessage(companyToken[0], phoneContact[0].phone, msg, msg.id_plataforma_zenvia)
      if (resultZenviaSend.error || resultZenviaSend.data.sendSmsResponse.statusDescription === 'Error')
        return res.status(400).send({ error: resultZenviaSend.error })

      const statusMessage = await statusMessageModel.create(resultZenviaSend.data, messageId.id)
      if (statusMessage.error)
        return res.status(400).send({ error: statusMessage.error })
      console.log(`ENVIO DA MSG ==>> ${msg} ==>> para o numero ${phoneContact[0].phone}
      PELA COMPANY ==>> ${companyToken[0].name}`)
      return res.status(200).send({ send: true })
    } catch (error) {
      console.log('ERRO AO ENVIAR MENSAGE ==>> CONTROLLER ==>>', error.response)
      return res.status(500).send({ error: 'Erro ao enviar a mensagem.' })
    }

  }

  async getZenviaStatus() {
    try {
      const allCompanies = await companyModel.getAll()

      const activatedCompanies = allCompanies.filter(company => company.activated)

      activatedCompanies.map(async (actualCompany) => {
        let allMessagesWithoutReceived = await messageModel.getMessagesWithoutReceived()

        if (allMessagesWithoutReceived.error)
          return { error: allMessagesWithoutReceived.error }

        allMessagesWithoutReceived.map(async (message) => {
          let zenviaData = await zenviaService.getStatusById(message.id_plataforma_zenvia, actualCompany)
          if (zenviaData.error)
            return
          await statusMessageModel.update(zenviaData, message.id)
          await messageModel.saveStatusOnMessageTable(zenviaData.statusDescription, message.id)

        })
      })

    } catch (error) {
      console.log('ERRO AO BUSCAR OS STATUS ZENVIA ==>> ', error)
    }
  }

  async getNewMessages() {
    try {
      const allCompanies = await companyModel.getAll()

      let activatedCompanies = allCompanies.filter(company => company.activated)
      activatedCompanies.map(async (actualCompany) => {
        let messages = await zenviaService.getNewMessages(actualCompany)
        if (messages != null && !messages.error) {

          if (!Array.isArray(messages))
            return

          messages.forEach(async (msg) => {

            const alreadyInserted = await messageModel.messageAlreadyInserted(msg, actualCompany.token)
            if (alreadyInserted)
              return

            let protocol, company, reply

            protocol = await protocolModel.getProtocolByPhone(msg.mobile, actualCompany.token)
            if (protocol.length) {
              protocol = protocol[0]
              company = await protocolModel.getCompany(protocol.id)

              reply = await messageModel.insertReply(protocol.id, company[0].id, msg)

              if (typeof reply != 'undefined') {
                let msgObj = {
                  body: msg.body,
                  chat: {
                    id: protocol.id
                  },
                  token: company[0].token,
                  channel: 'sms',
                  phone: msg.mobile
                }
                console.log('ENVIAR NO WEBHOOK ==>>', company[0].callback)
                console.log('DADOS             ==>>', msgObj)
                webHook.sendMessage(company[0].callback, msgObj)

              }
            } else {
              //criar protocolo
              const contactId = await contactModel.createContact(msg.mobile)

              const protocolo = await protocolModel.create(actualCompany.id, contactId)
              const saveMessage = await messageModel.create(protocolo.id_protocol, msg.body,
                'Customer', msg.mobileOperatorName)

              let msgObj = {
                body: msg.body,
                chat: {
                  id: protocolo.id_protocol
                },
                token: actualCompany.token,
                channel: 'sms',
                phone: msg.mobile
              }
              console.log('ENVIAR NO WEBHOOK INCOMING ==>>', actualCompany.callback)
              console.log('DADOS             INCOMING==>>', msgObj)
              webHook.sendMessage(actualCompany.callback, msgObj)

            }

          })
        }

      })
    } catch (error) {
      // console.log('ERRO AO BUSCAR NOVOS SMS NA ZENVIA ==>> CONTROLLER ==>>', error)
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
      if (company.length == 0)
        return res.status(400).send({ error: 'Não existem uma company para o token informado.' })

      if (!company[0].activated)
        return res.status(400).send({ error: 'A company está desativada.' })


      const messagesToSend = req.body.messages

      const testArray = await Promise.all(messagesToSend.map(async actualMessage => {

        if (actualMessage.msg.length > 160)
          return res.status(400).send({ error: 'O texto da mensagem deve ser menor que 160 caracteres' })

        const contact = await contactModel.createContact(actualMessage.to)
        if (contact.error)
          return res.status(400).send({ error: contact.error })

        const protocolCampanha = await protocolModel.create(company[0].id, contact)
        if (protocolCampanha.error)
          return res.status(400).send({ error: contact.error })

        const messageId = await messageModel.create(protocolCampanha.id_protocol, actualMessage.msg, 'Company')
        if (messageId.error)
          return res.status(400).send({ error: messageId.error })

        const resultZenviaSend = await zenviaService.sendMessage(company[0], actualMessage.to, actualMessage.msg, messageId.id_plataforma_zenvia)
        if (resultZenviaSend.error)
          return res.status(400).send({ error: resultZenviaSend.error })

        const statusMessage = await statusMessageModel.create(resultZenviaSend.data, messageId.id)
        if (statusMessage.error)
          return res.status(400).send({ error: statusMessage.error })

        protocols.push({ protocol: protocolCampanha.id_protocol, to: actualMessage.to })
        return protocolCampanha.id_protocol
      }))
      return res.status(201).send(protocols)
    } catch (error) {
      console.log('ERRO NO ENVIO MULTIPLO DE MSG ==>>', error)
      return res.status(500).send({ error: 'Houve um erro no servidor.' })
    }
  }
}

module.exports = MessageController
