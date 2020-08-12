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

      return { error: 'Erro ao criar a mensage' }
    } catch (error) {
      console.log('ERRO AO CRIAR A MENSAGEM ==>> MODEL ==>>', error)
      return { error: 'Erro ao criar a mensage' }
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
      return { error: 'Erro ao criar a mensage' }
    }
  }

  async insertReply(protocol, company, obj) {
    try {
      const date = moment().format()

      const msg = {}

      const messageAlreadyInserted = await database('message').select('id_zenvia')
        .where({
          'id_zenvia': obj.id
        })

      console.log('ESSAS MENSAGENS EXISTEM ==>>', Boolean(messageAlreadyInserted.lenght))

      let msgInserted
      if (!Boolean(messageAlreadyInserted.lenght)) {
        //vou inserir a msg
        msg.source = 'Customer'
        msg.id_zenvia = obj.id
        msg.created_at = date
        msg.updated_at = date
        msg.mobile_operator_name = obj.mobileOperatorName
        msg.msg = obj.body
        msg.mobile_operator_name = obj.mobileOperatorName
        msg.id_protocol = protocol
        console.log('MENSAGEM A SER INSERIDA COMO RESPOSTA ==>>', msg)

        msgInserted = await database('message').returning(['id']).insert(msg)
        console.log('RESULTADO DA INSERÇÃO ===>>>', msgInserted)
      }

    } catch (error) {

    }
  }
}

module.exports = MessageModel
