import { SuperAgentRequest } from 'superagent'
import incomingMovements from './responses/incomingMovemnts'
import { stubFor } from './wiremock'

export default {
  stubIncomingMovements: (activeCaseLoadId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/incoming-moves/${activeCaseLoadId}\\?date=.*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: incomingMovements,
      },
    })
  },
}
