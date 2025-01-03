const database = require('../config/database/database')

class ReportModel {

  async listProtocoByStatus(companyId, listProtocol, status) {
    try {

      const result = await database('status_message')
        .select({
          status: 'status_description',
          protocol_id: 'protocol.id',
          messageid: 'message.id'
        }).leftJoin('message', 'status_message.id_message', 'message.id')
        .leftJoin('protocol', 'message.id_protocol', 'protocol.id')
        .where('protocol.id_company', companyId)
        .whereIn('protocol.id', listProtocol)
        .andWhere('status_description', status)

      return result
    } catch (error) {
      console.log('ERRO AO BUSCAR OS STATUS => MODEL =>', error)
      return { error: 'Ocorreu um erro ao buscar os status.' }
    }

  }

}
module.exports = ReportModel
