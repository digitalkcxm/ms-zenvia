const CompanyController = require('../../src/controllers/CompanyController')
const CompanyModel = require('../../src/models/CompanyModel')

const request = require('supertest')
const app = require('../../src/config/server')

const makeSut = () => {
  const companyModel = new CompanyModel()
  const companyController = new CompanyController()
  return {
    companyModel, companyController
  }
}

describe('Company Controller test', () => {
  it('Should create a new Company', async (done) => {
    const newCompany = {
      "name": "Test Company1234",
      "callback": "https://callback/api/v1/incoming/zenvia"
    }

    const result = await request(app)
      .post('/api/v1/company')
      .send(newCompany)

    expect(result.id).not.toBeNull()
    expect(result.body.name).toEqual(newCompany.name)
    expect(result.body.callback).toEqual(newCompany.callback)
    expect(result.status).toBe(201)
    expect(result.body.activated).toBeTruthy()
    done()
  })
})
