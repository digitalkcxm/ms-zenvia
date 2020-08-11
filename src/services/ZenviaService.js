const axios = require('axios')
const { timeout } = require('cron')
const moment = require('moment')

class ZenviaService {

  async sendMessage(from, to, schedule = null, msg, flashSms = false, msgId) {
    try {
      const instance = await this._istance()

      if (instance.error)
        return instance.error

      const result = await instance.post('/send-sms', {
        sendSmsRequest: {
          from: from.name,
          to: to,
          msg: msg,
          flashSms: flashSms,
          id: msgId
        }
      })
      return result
    } catch (error) {
      console.log('ERRO AO ENVIAR A MENSAGEM ==>> ZENVIA SERVICE ==>>', error)
      return { error: error }
    }
  }

  _istance() {
    try {
      return axios.create({
        baseURL: process.env.BASE_ZENVIA,
        timeout: 180000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': process.env.AUTHORIZATION_ZENVIA
        }
      })
    } catch (error) {
      return { error: 'Erro ao criar instancia.' }
    }
  }
}

module.exports = ZenviaService
