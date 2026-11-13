import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export default {
  stubPing: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/xrayBodyScansApi/health/ping',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: 'UP' },
      },
    })
  },

  stubGetBodyScan: (details: Record<string, unknown>): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/xrayBodyScansApi/prisoner/.*/scan/summary.*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: details,
      },
    })
  },

  stubBulkGetBodyScans: (details: Record<string, unknown>[]): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/xrayBodyScansApi/bulk/summary`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: details || [],
      },
    })
  },
}
