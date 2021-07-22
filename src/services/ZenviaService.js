const axios = require('axios')
const moment = require('moment')
class ZenviaService {

  async sendMessage(company, to, msg, msgId) {
    try {
      const instance = await this._istance(company.zenvia_token)
      if (instance.error)
        return instance.error

      let result

      if (company.aggregated_id) {
        result = await instance.post('/send-sms', {
          sendSmsRequest: {
            to: to,
            msg: msg,
            id: msgId,
            aggregateId: company.aggregated_id
          }
        })
      } else {
        result = await instance.post('/send-sms', {
          sendSmsRequest: {
            to: to,
            msg: msg,
            id: msgId
          }
        })
      }

      return result
    } catch (error) {
      console.log('ERRO AO ENVIAR A MENSAGEM ==>> ZENVIA SERVICE ==>>', error.response.config , '\nDATA', error.response.data)
      return { error: error }
    }
  }

  async getStatusById(id, actualCompany) {
    try {
      const instance = await this._istanceStatus(actualCompany.zenvia_token)
      if (instance.error)
        return instance.error

      const result = await instance.get(`/get-sms-status/${String(id)}`)
      return result.data.getSmsStatusResp
    } catch (error) {
      //console.log('ERRO AO ATUALIZAR STATUS ==>> ZENVIA SERVICE ==>>', error)
      return { error: 'Erro ao buscar status' }
    }
  }

  async getNewMessages(company) {
    try {
      const instance = await this._istance(company.zenvia_token)
      if (instance.error)
        return instance.error

      const resultNewMessages = await instance.post(`/received/list`)
      const allMessages = resultNewMessages.data.receivedResponse.receivedMessages
      return allMessages
    } catch (error) {
      console.log('ERRO AO BUSCAR NOVAS MENSAGENS ==>> ZENVIA SERVICE ==>>', error)
      return { error: 'Erro ao buscar novas mensagens' }
    }
  }


  _istance(authorization_zenvia) {
    try {
      return axios.create({
        baseURL: process.env.BASE_ZENVIA,
        timeout: 180000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authorization_zenvia
        }
      })
    } catch (error) {
      return { error: 'Erro ao criar instancia.' }
    }
  }

  _istanceStatus(authorization_zenvia) {
    try {
      return axios.create({
        baseURL: process.env.BASE_ZENVIA,
        timeout: 180000,
        headers: {
          'Accept': 'application/json',
          'Authorization': authorization_zenvia
        }
      })
    } catch (error) {
      return { error: 'Erro ao criar instancia.' }
    }
  }
}

module.exports = ZenviaService
