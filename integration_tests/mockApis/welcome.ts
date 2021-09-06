import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export default {
  stubIncomingMovements: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/welcome/incoming-moves/MDI\\?date=.*',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [],
      },
    })
  },
}
