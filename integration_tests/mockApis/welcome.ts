import { SuperAgentRequest } from 'superagent'
import fs from 'fs'
import path from 'path'
import defaultUserCaseLoads from './responses/userCaseLoads'
import temporaryAbsences from './responses/temporaryAbsences'
import imprisonmentStatuses from './responses/imprisonmentStatuses'
import { getMatchingRequests, stubFor } from './wiremock'

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
  stubUserCaseLoads: (userCaseLoads: Record<string, string>[] = defaultUserCaseLoads): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/welcome/prison/users/me/caseLoads',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: userCaseLoads,
      },
    })
  },
  stubExpectedArrival: (expectedArrival: Record<string, string>): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/arrivals/${expectedArrival.id}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: expectedArrival,
      },
    })
  },
  stubExpectedArrivals: ({
    caseLoadId,
    arrivals,
  }: {
    caseLoadId: string
    arrivals: Record<string, unknown>[]
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/prisons/${caseLoadId}/arrivals\\?date=.*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: arrivals,
      },
    })
  },
  stubRecentArrivals: ({
    caseLoadId,
    recentArrivals,
  }: {
    caseLoadId: string
    recentArrivals: Record<string, unknown>
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/prisons/${caseLoadId}/recent-arrivals\\?fromDate=.*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: recentArrivals,
      },
    })
  },
  stubMatchedRecords: (matches: Record<string, string>[]): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/welcome/match-prisoners`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: matches,
      },
    })
  },

  stubUnexpectedArrivalsMatchedRecords: (matches: Record<string, string>[]): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/welcome/match-prisoners`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: matches,
      },
    })
  },

  stubTransfer: ({
    caseLoadId,
    prisonNumber,
    transfer,
  }: {
    caseLoadId: string
    prisonNumber: string
    transfer: Record<string, string>
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/prisons/${caseLoadId}/transfers/${prisonNumber}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: transfer,
      },
    })
  },
  stubTransfers: ({
    caseLoadId,
    transfers,
  }: {
    caseLoadId: string
    transfers: Record<string, unknown>[]
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/prisons/${caseLoadId}/transfers`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: transfers,
      },
    })
  },

  stubConfirmTransfer: (prisonNumber: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/welcome/transfers/${prisonNumber}/confirm`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { prisonNumber: 'A1234AB', location: 'Reception' },
      },
    })
  },

  stubConfirmTransferReturnsError: ({ prisonNumber, status }: Record<string, string>): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/welcome/transfers/${prisonNumber}/confirm`,
      },
      response: {
        status,
      },
    })
  },

  stubTemporaryAbsence: ({
    activeCaseLoadId,
    prisonNumber,
    temporaryAbsence,
  }: {
    activeCaseLoadId: string
    prisonNumber: string
    temporaryAbsence: Record<string, string>
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/prison/${activeCaseLoadId}/temporary-absences/${prisonNumber}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: temporaryAbsence,
      },
    })
  },
  stubTemporaryAbsences: (activeCaseLoadId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/prison/${activeCaseLoadId}/temporary-absences`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: temporaryAbsences,
      },
    })
  },
  stubConfirmTemporaryAbsence: (prisonNumber: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/welcome/temporary-absences/${prisonNumber}/confirm`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { prisonNumber: 'A1234AB', location: 'Reception' },
      },
    })
  },

  stubConfirmTemporaryAbsenceReturnsError: ({ prisonNumber, status }: Record<string, string>): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/welcome/temporary-absences/${prisonNumber}/confirm`,
      },
      response: {
        status,
      },
    })
  },
  stubConfirmCourtReturn: (arrivalId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/welcome/court-returns/${arrivalId}/confirm`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { prisonNumber: 'A1234AB', location: 'Reception' },
      },
    })
  },
  stubConfirmCourtReturnsError: ({ arrivalId, status }: Record<string, string>): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/welcome/court-returns/${arrivalId}/confirm`,
      },
      response: {
        status,
      },
    })
  },
  stubPrisonerImage: (prisoner: Record<string, string>): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/prisoners/${prisoner.prisonerNumber}/image`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
        },
        base64Body: Buffer.from(fs.readFileSync(path.join(__dirname, `../images/${prisoner.imageFile}`))).toString(
          'base64'
        ),
      },
    })
  },
  stubMissingPrisonerImage: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/prisoners/.*?/image`,
      },
      response: {
        status: 404,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      },
    })
  },
  stubPrisonerDetails: (details): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/prisoners/${details.prisonNumber}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: details,
      },
    })
  },
  stubPrison: (activeCaseLoadId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/prison/${activeCaseLoadId}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { description: 'Moorland (HMP & YOI)' },
      },
    })
  },
  stubCreateOffenderRecordAndBooking: (
    arrivalId: string,
    prisonNumber = 'A1234BC',
    location = 'Reception'
  ): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/welcome/arrivals/${arrivalId}/confirm`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { prisonNumber, location },
      },
    })
  },
  stubCreateOffenderRecordAndBookingReturnsError: ({
    arrivalId,
    status,
  }: Record<string, number>): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/welcome/arrivals/${arrivalId}/confirm`,
      },
      response: {
        status,
      },
    })
  },
  stubConfirmUnexpectedArrval: ({ prisonNumber, location }: Record<string, number>): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/welcome/unexpected-arrivals/confirm`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { prisonNumber, location },
      },
    })
  },
  stubImprisonmentStatus: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/imprisonment-statuses`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: imprisonmentStatuses,
      },
    })
  },
  getCourtReturnConfirmationRequest: id =>
    getMatchingRequests({
      method: 'POST',
      urlPath: `/welcome/court-returns/${id}/confirm`,
    }).then(data => {
      const { requests } = data.body
      if (!requests.length) {
        throw new Error('No matching request')
      }
      return JSON.parse(requests[0].body)
    }),
  getConfirmationRequest: id =>
    getMatchingRequests({
      method: 'POST',
      urlPath: `/welcome/arrivals/${id}/confirm`,
    }).then(data => {
      const { requests } = data.body
      if (!requests.length) {
        throw new Error('No matching request')
      }
      return JSON.parse(requests[0].body)
    }),
  getUnexpectedConfirmationRequest: () =>
    getMatchingRequests({
      method: 'POST',
      urlPath: `/welcome/unexpected-arrivals/confirm`,
    }).then(data => {
      const { requests } = data.body
      if (!requests.length) {
        throw new Error('No matching request')
      }
      return JSON.parse(requests[0].body)
    }),
  getTransferConfirmationRequest: prisonNumber =>
    getMatchingRequests({
      method: 'POST',
      urlPath: `/welcome/transfers/${prisonNumber}/confirm`,
    }).then(data => {
      const { requests } = data.body
      if (!requests.length) {
        throw new Error('No matching request')
      }
      return JSON.parse(requests[0].body)
    }),
}
