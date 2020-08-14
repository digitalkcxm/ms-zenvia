const axios = require('axios')

class WebHook{

async sendMessage(url, obj){
  try {

    const instance = this._instance(url)

    await instance.post('', obj)

  } catch (error) {
    console.log('ERRO AO ENVIAR A MENSAGEM NO CALLBACK ==> WEBHOOK  ==>>', error)
  }
}

_instance(url){
  return axios.create({
    baseUrl: url,
    timeout: 180000,
    headers: {'Content-Type': 'application/json'}
  })
}

}

module.exports = WebHook
