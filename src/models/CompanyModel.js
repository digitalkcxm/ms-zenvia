const database = require('../config/database/database')

class CompanyModel{

  async getAll(){
    try {
      const allCompanies = await database('company').orderBy('created_at', 'asc')
            
      return allCompanies
    } catch (error) {
      console.log('ERRO AO BUSCAR TODAS COMPANIES => MODEL =>', error)
      return {error : 'Ocorreu um erro ao recuperar as companies.'}
    }
  }

  async getById(id){
    try {
      
      const companies = await database('company').where({ id })

      return companies[0]
    } catch (error) {
      console.log('ERRO AO BUSCAR POR ID => MODEL =>', error)
      return {error : 'Ocorreu um erro ao recuperar a companie.'}
    }

  }

  async create(obj){
    try {
      const companyCreated = await database('company').returning(['id', 'name', 'callback', 'token_company', 'activated', 'created_at' ]).insert( obj )
      return companyCreated
    } catch (error) {
      console.log('ERRO AO CRIAR COMPANY => MODEL =>', error)
      return {error : 'Ocorreu um erro ao criar a company.'}
    }
  }

  async update(id, obj){
    try {
      const updatedCompany = await database('company').returning(['id', 'name', 'callback', 'token_company', 'activated', 'updated_at' ]).update( obj ).where({ id })
      return updatedCompany
    } catch (error) {
      console.log('ERRO AO ATUALIZAR COMPANY => MODEL =>', error)
      return {error : 'Ocorreu um erro ao atualizar a company.'}
    }
  }
}

module.exports = CompanyModel