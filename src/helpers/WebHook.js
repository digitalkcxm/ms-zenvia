const axios = require('axios')
class WebHook {
  async sendMessage(url, obj) {
    //console.log("WebHook -> sendMessage -> url, obj", url, obj)
    let result
    try {
      const instance = this._instance(url)
      try {
        result = await instance.post('/', obj)
      } catch (err) {
        console.log('ERRO MISERAVEL ==>>', err)
      }
      return true
    } catch (error) {
      console.log('ERRO AO ENVIAR A MENSAGEM NO CALLBACK ==> WEBHOOK  ==>>', error)
      return true
    }
  }

  _instance(url) {
    return axios.create({
      baseURL: url,
      timeout: 180000,
      headers: { 'Content-Type': 'application/json' }
    })
  }

}

module.exports = WebHook
