import { SuperAgentRequest } from 'superagent'
import fs from 'fs'
import path from 'path'
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
  stubNoExpectedArrivals: (activeCaseLoadId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/welcome/incoming-moves/${activeCaseLoadId}\\?date=.*`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [],
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
}
