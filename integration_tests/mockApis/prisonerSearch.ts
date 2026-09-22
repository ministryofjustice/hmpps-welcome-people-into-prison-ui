import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export default {
  stubPing: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/prisonerSearch/health/ping',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: 'UP' },
      },
    })
  },

  stubGetPrisoner: (prisonerNumber: string, prisonId = 'MDI'): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prisonerSearch/prisoner/${prisonerNumber}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { prisonerNumber, prisonId, bookingId: '123456' },
      },
    })
  },
}
