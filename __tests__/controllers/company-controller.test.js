
const request = require('supertest')
const app = require('../../src/config/server')

let createdCompany, updatedCompany = {}

describe('Company Controller test', () => {
  it('Should create a new Company', async (done) => {
    const newCompany = {
      "name": "Company2",
      "callback": "https://callback/api/v1/incoming/zenvia"
    }

    const result = await request(app)
      .post('/api/v1/company')
      .send(newCompany)
    createdCompany = result.body

    expect(result.id).not.toBeNull()
    expect(result.body.name).toEqual(newCompany.name)
    expect(result.body.callback).toEqual(newCompany.callback)
    expect(result.status).toBe(201)
    expect(result.body.activated).toBeTruthy()
    done()
  })

  it('Should update an company', async (done) =>{
    updatedCompany.id = createdCompany.id
    updatedCompany.name = 'Updated_name'
    updatedCompany.callback = 'https://update.com.br'
    const result = await request(app)
      .put(`/api/v1/company`)
      .send(updatedCompany)
    console.log('ERRO AQUI ==>>', result.error)
      expect(result.id).not.toBeNull()
      expect(result.body.name).toEqual(updatedCompany.name)
      expect(result.body.callback).toEqual(updatedCompany.callback)
      expect(result.status).toBe(200)
      expect(result.body.activated).toBeTruthy()
      done()
  })

  it('Should get an company by id', async (done) =>{
    const result = await request(app)
    .get('/api/v1/company/', createdCompany.id)
    expect(result.status).toBe(200)
    expect(result.body[0].id).not.toBeNull()
    expect(result.body[0].name).toEqual(updatedCompany.name)
    expect(result.body[0].callback).toEqual(updatedCompany.callback)
    done()
  })

  it('Should get all companies', async (done) =>{

    const result = await request(app)
    .get('/api/v1/company')
    expect(result.status).toBe(200)
    done()
  })
})
