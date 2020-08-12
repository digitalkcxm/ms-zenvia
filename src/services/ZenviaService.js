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

  async getNewMessages() {
    try {
      let startDate = moment().subtract("5", "days").format('YYYY/MM/DD HH:mm:ss')
      startDate = startDate.replace(' ', 'T')
      startDate = startDate.replace('/', '-')
      startDate = startDate.replace('/', '-')

      let actualDate = moment().format('YYYY/MM/DD HH:mm:ss')
      actualDate = actualDate.replace(' ', 'T')
      actualDate = actualDate.replace('/', '-')
      actualDate = actualDate.replace('/', '-')

      const instance = await this._istance()
      if (instance.error)
        return instance.error

      const resultNewMessages = await instance.get(`/received/search/${startDate}/${actualDate}`)

      const allMessages = resultNewMessages.data.receivedResponse.receivedMessages
      return allMessages
    } catch (error) {
      console.log('ERRO AO BUSCAR NOVAS MENSAGENS ==>> ZENVIA SERVICE ==>>', error)
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
