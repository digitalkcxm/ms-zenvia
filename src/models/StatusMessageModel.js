const moment = require('moment')
const database = require('../config/database/database')

class StatusMessageModel {

  async create(obj, idMessage) {
    try {
      const status = {}
      status.status_code        = obj.sendSmsResponse.statusCode
      status.status_description = obj.sendSmsResponse.statusDescription
      status.detail_code        = obj.sendSmsResponse.detailCode
      status.detail_description = obj.sendSmsResponse.detailDescription
      status.id_message         = idMessage
      status.created_at         = moment().format()
      status.updated_at         = moment().format()

      const result = await database('status_message').returning('*').insert(status)

      return result
    } catch (error) {
      console.log('ERRO AO CRIAR STATUS DA MENSAGEM => MODEL =>', error)
      return { error: 'Ocorreu um erro ao tentar criar os status da mensagem.' }
    }
  }

  async update(obj, id_message) {
    try {
      const status = {}

      if (obj.received != null) {
        status.received = moment(obj.received).format()
      }else{
        status.received = null
      }
      status.status_code        = obj.statusCode
      status.status_description = obj.statusDescription
      status.detail_code        = obj.detailCode
      status.detail_description = obj.detailDescription
      
      const result = await database('status_message').returning(['id'])
        .update(status).where({ id_message })

      return result
    } catch (error) {
      console.log('ERRO AO ATUALIZAR STATUS DA MENSAGEM => MODEL =>', error)
      return { error: 'Ocorreu um erro ao tentar atualizar os status da mensagem.' }
    }
  }

}

module.exports = StatusMessageModel
