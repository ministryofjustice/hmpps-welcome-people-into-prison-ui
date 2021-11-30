import { SuperAgentRequest } from 'superagent'
import fs from 'fs'
import path from 'path'
import defaultUserCaseLoads from './responses/userCaseLoads'
import temporaryAbsences from './responses/temporaryAbsences'
import imprisonmentStatuses from './responses/imprisonmentStatuses'
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
        urlPattern: `/welcome/prisons/${caseLoadId}/transfers/enroute/${prisonNumber}`,
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
        urlPattern: `/welcome/prisons/${caseLoadId}/transfers/enroute`,
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
        jsonBody: {},
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
  stubPrisonerImage: (prisoner: Record<string, string>): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/prison/prisoner/${prisoner.prisonerNumber}/image`,
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
        urlPattern: `/welcome/prison/prisoner/.*?/image`,
      },
      response: {
        status: 404,
        headers: {
          'Content-Type': 'image/jpeg',
        },
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
  stubCreateOffenderRecordAndBooking: (arrivalId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/welcome/arrivals/${arrivalId}/confirm`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { offenderNo: 'A1234AB' },
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
}
