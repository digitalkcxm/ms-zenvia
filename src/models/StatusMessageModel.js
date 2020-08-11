const moment = require('moment')
const database = require('../config/database/database')

class StatusMessageModel {

  async create(obj, idMessage){
    try {
      const status = {}
      status.status_code        = obj.sendSmsResponse.statusCode
      status.status_description = obj.sendSmsResponse.statusDescription
      status.detail_code        = obj.sendSmsResponse.detailCode
      status.detail_description = obj.sendSmsResponse.detailDescription
      status.id_message = idMessage
      status.created_at = moment().format('DD/MM/YYYY HH:mm')
      status.updated_at = moment().format('DD/MM/YYYY HH:mm')

      const result = await database('status_message').returning('*').insert(status)

      return result
    } catch (error) {
      console.log('ERRO AO CRIAR STATUS DA MENSAGEM => MODEL =>', error)
      return { error: 'Ocorreu um erro ao tentar criar os status da mensagem.' }
    }
  }

}

module.exports = StatusMessageModel
