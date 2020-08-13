const moment = require('moment')
const database = require('../config/database/database')
const { where } = require('../config/database/database')

class MessageModel {

  async create(id_protocol, from, schedule, msg,
    source, mobile = '', mobile_operator_name = '', callback_option = '', flash_sms = false) {
    try {
      const result = await database('message').returning(['id']).insert({
        id_protocol, schedule, msg,
        source, mobile_operator_name,
        created_at: moment().format(), updated_at: moment().format()
      })
      if (result)
        return result[0].id

      return { error: 'Erro ao criar a mensagem.' }
    } catch (error) {
      console.log('ERRO AO CRIAR A MENSAGEM ==>> MODEL ==>>', error)
      return { error: 'Erro ao criar a mensagem.' }
    }
  }

  async getMessagesWithoutReceived() {
    try {

      const messages = await database('message').select('message.id')
        .leftJoin('status_message', 'message.id', 'status_message.id_message')
        .whereNull('status_message.received')
        .whereNotNull('status_message.id_message')

      return messages
    } catch (error) {
      console.log('ERRO AO CRIAR AO BUSCAR MENSAGENS SEM RECEIVED ==>> MODEL ==>>', error)
      return { error: 'Erro ao criar a mensagem.' }
    }
  }

  async insertReply(protocol, company, obj) {
    try {
      const date = moment().format()

      const msg = {}
      const messageAlreadyInserted = await database('message').select('*')
        .where({
          'id_zenvia': String(obj.id)
        })

      let msgInserted
      if (!messageAlreadyInserted.length) {
        msg.source = 'Customer'
        msg.id_zenvia = obj.id
        msg.created_at = date
        msg.updated_at = date
        msg.mobile_operator_name = obj.mobileOperatorName
        msg.msg = obj.body
        msg.mobile_operator_name = obj.mobileOperatorName
        msg.id_protocol = protocol
        msgInserted = await database('message').returning(['id']).insert(msg)
      }

      return msgInserted
    } catch (error) {
      console.log('ERRO AO CRIAR MENSAGEM DO CUSTOMER ==>> MODEL ==>>', error)
      return { error: 'Erro ao criar a mensagem do customer.' }
    }
  }
}

module.exports = MessageModel
