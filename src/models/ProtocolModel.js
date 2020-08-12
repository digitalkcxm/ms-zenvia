const database = require('../config/database/database')

class ProtocolModel {

  async create(id_company, id_contact) {
    try {
      const obj = {}

      id_company ? obj.id_company = id_company : ''
      id_contact ? obj.id_contact = id_contact : ''

      const protocolExists = await database('protocol').select('id').where({ id_company, id_contact, closed: false })

      if (protocolExists.length > 0)
        return { id_protocol: protocolExists[0].id }

      const newProtocol = await database('protocol').returning(['id']).insert(obj)

      return { id_protocol: newProtocol[0].id }

    } catch (error) {
      console.log('ERRO AO CRIAR PROTOCOLO => MODEL =>', error)
      return { error: 'Ocorreu um erro ao tentar criar um protocolo.' }
    }

  }

  async getById(id) {
    try {

      const protocol = await database('protocol').select('*').where({ id })

      if (!Boolean(protocol[0]))
        return { error: 'O protocolo não foi encontrado.' }

      return protocol
    } catch (error) {
      console.log('ERRO AO BUSCAR PROTOCOLO => MODEL =>', error)
      return { error: 'Ocorreu um erro ao buscar o protocolo.' }
    }
  }
  async getPhoneByProtocol(id_protocol) {
    try {

      const phone = await database('protocol').select('phone')
        .innerJoin('contact', 'protocol.id_contact', 'contact.id')
        .where({ 'protocol.id': id_protocol })

      return phone
    } catch (error) {
      console.log('ERRO AO BUSCAR POR TELEFONE => MODEL =>', error)
      return { error: 'Ocorreu um erro ao recuperar o telefone do contato.' }
    }
  }

  async getProtocolByPhone(phone) {
    try {
      const protocol = await database('protocol').select('*')
        .innerJoin('contact', 'protocol.id_contact', 'contact.id')
        .where({
          'contact.phone': phone,
          'protocol.closed': false
        })
      return protocol
    } catch (error) {

    }
  }

  async getCompany(protocol){
    try {
      const company = await database('protocol').select('*')
      .innerJoin('company', 'protocol.id_company', 'company.id')
      .where({
        'protocol.id' : protocol
      })
      return company
    } catch (error) {

    }
  }

  async close(id) {
    try {
      const closedProtocol = await database('protocol').update({ closed: true }).where({ id })

      return closedProtocol
    } catch (error) {
      console.log('ERRO AO FECHAR PROTOCOLO => MODEL =>', error)
      return { error: 'Ocorreu um erro ao fechar o protocolo.' }
    }
  }

}

module.exports = ProtocolModel
