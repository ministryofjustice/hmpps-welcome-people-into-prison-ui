import { SuperAgentRequest } from 'superagent'
import { getMatchingRequests, stubFor } from './wiremock'

export default {
  stubPing: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/bodyscan/health/ping',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: 'UP' },
      },
    })
  },

  stubBodyScanPrisonerDetails: (details): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/bodyscan/prisoners/${details.prisonNumber}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: details,
      },
    })
  },

  stubGetBodyScan: ({ prisonNumber, details }: Record<string, number>): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/bodyscan/body-scans/prisoners/${prisonNumber}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: details,
      },
    })
  },

  stubAddBodyScan: (details): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/bodyscan/body-scans/prisoners`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: details || [],
      },
    })
  },

  stubSubmitBodyScan: ({ prisonNumber }: Record<string, number>): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/bodyscan/body-scans/prisoners/${prisonNumber}`,
      },
      response: {
        status: 204,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },

  stubRetrieveBodyScanRequest: prisonNumber =>
    getMatchingRequests({
      method: 'POST',
      urlPath: `/bodyscan/body-scans/prisoners/${prisonNumber}`,
    }).then(data => {
      const { requests } = data.body
      if (!requests.length) {
        throw new Error('No matching request')
      }
      return JSON.parse(requests[0].body)
    }),
}
