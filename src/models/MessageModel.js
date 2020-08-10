const moment = require('moment')
const database = require('../config/database/database')

class MessageModel {

  async create(id_protocol, from, schedule, msg,
    source, mobile = '', mobile_operator_name = '', callback_option = '', flash_sms = false) {
    try {

      const result = await database('message').returning(['id']).insert({
        id_protocol, from, schedule, msg,
        source, mobile, mobile_operator_name, callback_option,
        flash_sms, created_at: moment().format('DD/MM/YYYY HH:mm'), updated_at: moment().format('DD/MM/YYYY HH:mm')
      })

      if (result)
        return result[0].id

      return { error: 'Erro ao criar a mensage' }
    } catch (error) {
      console.log('ERRO AO CRIAR A MENSAGEM ==>> MODEL ==>>', error)
      return { error: 'Erro ao criar a mensage' }
    }
  }
}

module.exports = MessageModel
