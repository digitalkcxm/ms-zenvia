const database = require('../config/database/database')

class ContactModel {

  async createContact(phone) {

    try {
      const contact = await database('contact').returning(['id']).insert({ phone })
      return contact
    } catch (error) {
      console.log('ERRO AO CRIAR CONTACT => MODEL =>', error)
      return { error: 'Ocorreu um erro ao criar um contact.' }
    }

  }

}

module.exports = ContactModel