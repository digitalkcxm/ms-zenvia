const database = require('../config/database/database')

class ContactModel {

  async createContact(phone) {
    try {
      const phoneAlreadyExists = await database('contact').select('id').where({ phone })
      if (phoneAlreadyExists.length > 0)
        return phoneAlreadyExists[0].id

      const newContact = await database('contact').returning(['id']).insert({ phone })
      return newContact[0].id
    } catch (error) {
      console.log('ERRO AO CRIAR CONTACT => MODEL =>', error)
      return { error: 'Ocorreu um erro ao criar um contact.' }
    }
  }
}

module.exports = ContactModel
