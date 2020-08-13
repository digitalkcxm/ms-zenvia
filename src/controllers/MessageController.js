const CompanyModel = require('../models/CompanyModel')
const Moment = require('moment')
const MessageModel = require('../models/MessageModel')
const ZenviaService = require('../services/ZenviaService')
const ProtocolModel = require('../models/ProtocolModel')
const StatusMessageModel = require('../models/StatusMessageModel')

const companyModel = new CompanyModel()
const messageModel = new MessageModel()
const zenviaService = new ZenviaService()
const protocolModel = new ProtocolModel()
const statusMessageModel = new StatusMessageModel()

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

      return res.status(200).send({ send: true })
    } catch (error) {
      console.log('ERRO AO ENVIAR MENSAGE ==>> CONTROLLER ==>>', error)
      return res.status(400).send({ error : 'Erro ao enviar a mensagem.'})
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
      let protocol,company, reply

      messages.map(async (msg) =>{

        protocol = await protocolModel.getProtocolByPhone(msg.mobile)

        company = await protocolModel.getCompany(protocol[0].id)

        reply = await messageModel.insertReply(protocol[0].id, company[0].id, msg)

        if(reply == 'undefined'){
          console.log('VOU FAZER NADA')
        }else{
          console.log('VOU MANDAR NO CALLBACK')
        }
      })

    } catch (error) {
      console.log('ERRO AO BUSCAR NOVOS SMS NA ZENVIA ==>> CONTROLLER ==>>', error)
    }
  }
}

module.exports = MessageController
