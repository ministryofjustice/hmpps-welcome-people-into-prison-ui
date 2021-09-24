import { SuperAgentRequest } from 'superagent'
import expectedArrivals from './responses/expectedArrivals'
import temporaryAbsences from './responses/temporaryAbsences'
import { stubFor } from './wiremock'

export default {
  stubPing: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/welcome/health/ping',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: 'UP' },
      },
    })
  },
  stubExpectedArrivals: (activeCaseLoadId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/incoming-moves/${activeCaseLoadId}\\?date=.*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: expectedArrivals,
      },
    })
  },
  stubTemporaryAbsences: (activeCaseLoadId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/temporary-absences/${activeCaseLoadId}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: temporaryAbsences,
      },
    })
  },
}
