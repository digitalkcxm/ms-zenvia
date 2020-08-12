const axios = require('axios')
const { timeout } = require('cron')
const moment = require('moment')

class ZenviaService {

  async sendMessage(from, to, schedule = null, msg, flashSms = false, msgId) {
    try {
      const instance = await this._istanceSendMessage()

      if (instance.error)
        return instance.error

      const result = await instance.post('/send-sms', {
        sendSmsRequest: {
          from: from,
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

  async getStatusById(id) {
    try {
      const instance = await this._istanceStatus()
      if (instance.error)
        return instance.error

      const result = await instance.get(`/get-sms-status/${String(id)}`)
      return result.data.getSmsStatusResp
    } catch (error) {
      console.log('ERRO AO ATUALIZAR STATUS ==>> ZENVIA SERVICE ==>>', error)
      return { error: error }
    }
  }

  _istanceSendMessage() {
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

  _istanceStatus() {
    try {
      return axios.create({
        baseURL: process.env.BASE_ZENVIA,
        timeout: 180000,
        headers: {
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
