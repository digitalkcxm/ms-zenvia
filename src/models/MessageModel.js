const moment = require('moment')
const database = require('../config/database/database')

class MessageModel {

  async create(id_protocol, msg,
    source, mobile_operator_name = '') {
    try {
      const result = await database('message').returning(['id']).insert({
        id_protocol, msg,
        source, mobile_operator_name,
        created_at: moment().format(), updated_at: moment().format()
      })
      if (result)
        return result[0].id

      return { error: 'Erro ao criar a mensagem.' }
    } catch (error) {
      console.log('ERRO AO CRIAR A MENSAGEM ==>> MODEL ==>>', error)
      return { error: 'Erro ao criar a mensagem.' }
    }
  }

  async getMessagesWithoutReceived() {
    try {

      const messages = await database('message').select('message.id')
        .leftJoin('status_message', 'message.id', 'status_message.id_message')
        .whereNotIn('status_message.detail_code', [120])

      return messages
    } catch (error) {
      console.log('ERRO AO CRIAR AO BUSCAR MENSAGENS SEM RECEIVED ==>> MODEL ==>>', error)
      return { error: 'Erro ao buscar status das mensagens.' }
    }
  }

  async insertReply(protocol, company, obj) {
    try {
      const date = moment().format()

      const msg = {}
      const messageAlreadyInserted = await database('message').select('*')
        .where({
          'id_zenvia': String(obj.id)
        })
      let msgInserted
      if (!messageAlreadyInserted.length) {
        msg.source = 'Customer'
        msg.id_zenvia = obj.id
        msg.created_at = date
        msg.updated_at = date
        msg.mobile_operator_name = obj.mobileOperatorName
        msg.msg = obj.body
        msg.mobile_operator_name = obj.mobileOperatorName
        msg.id_protocol = protocol
        msgInserted = await database('message').returning(['id']).insert(msg)
      }
      return msgInserted
    } catch (error) {
      console.log('ERRO AO CRIAR MENSAGEM DO CUSTOMER ==>> MODEL ==>>', error)
      return { error: 'Erro ao criar a mensagem do customer.' }
    }
  }

  async getMessages(date, token) {
    try {
      const messages = await database('message').select(
        'protocol.id                    as Protocolo',
        'company.name                   as Nome_da_Compania',
        'status_message.status_code     as Cod_Status_do_envio',
        'message.msg                    as Texto',
        'status_message.detail_code     as Status_de_Envio',
        'message.created_at             as Data_de_Envio',
        'status_message.received        as Data_da_Entrega')
        .leftJoin('protocol', 'protocol.id', 'message.id_protocol')
        .leftJoin('company', 'company.id', 'protocol.id_company')
        .leftJoin('status_message', 'status_message.id_message', 'message.id')
        .where('company.token', token)
        .whereNot('message.source', 'Customer')
        .whereBetween('message.created_at', [`${date.initDate}T${date.initHour}-300`, `${date.endDate}T${date.endHour}-300`])

      return messages
    } catch (error) {
      console.log('ERRO AO BUSCAR MENSAGENS PARA O RELATÓRIO ==>> MODEL ==>>', error)
      return { error: 'Erro ao buscar as mensagens.' }
    }
  }

  async getMessageStatus(idProtocol){
    try {
      const result = await database.raw(`
      select sm.status_description as "status"
      , m.id as "id_message"
      from status_message sm
      inner join message m  on sm.id_message  = m.id
      inner join protocol p on m.id_protocol  = p.id
      where m."source" = 'Company'
      and p.id in (${idProtocol})
      and m.id  = (select min(m1.id)
              from message m1
              inner join protocol p2 on m1.id_protocol = p2.id
              where p2.id in (${idProtocol}))
              limit 1;`)

    return result.rows
    } catch (err) {
      console.log('ERRO AO BUSCAR STATUS ==>>', err)
      return { error: 'Erro ao buscar status.' }
    }
  }

  async statusByMessages(messages, protocols){
    try {
      const result = await database.raw(`
      select sm.status_description as "status",
      count('*') as "Total_Status"
      from status_message sm
      inner join message m  on sm.id_message  = m.id
      inner join protocol p on m.id_protocol  = p.id
      where m."source" = 'Company'
      and p.id in (${protocols})
      and m.id in (${messages})
      group  by "status";`)

    return result.rows
    } catch (err) {
      console.log('ERRO AO BUSCAR STATUS ==>>', err)
      return { error: 'Erro ao buscar status.' }
    }
  }
}

module.exports = MessageModel
