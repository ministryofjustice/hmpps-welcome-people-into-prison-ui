import type { Express } from 'express'
import request from 'supertest'
import { Arrival, SexKeys } from 'welcome'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../../__testutils/appSetup'

import Role from '../../../../authentication/role'
import config from '../../../../config'
import { ExpectedArrivalsService } from '../../../../services'
import { LocationType } from '../../../../services/expectedArrivalsService'
import { expectSettingCookie } from '../../../__testutils/requestTestUtils'
import { State } from '../state'

jest.mock('../../../../services/expectedArrivalsService')
const expectedArrivalsService = new ExpectedArrivalsService(null, null, null) as jest.Mocked<ExpectedArrivalsService>

const arrival: Arrival = {
  firstName: 'James',
  lastName: 'Smith',
  dateOfBirth: '1973-01-08',
  prisonNumber: 'A1234BC',
  pncNumber: '11/5678',
  gender: SexKeys.MALE,
  date: '2020-01-08',
  fromLocation: 'Crown Court',
  fromLocationType: LocationType.COURT,
  id: '1234-2345-3456-4566',
  isCurrentPrisoner: false,
  fromLocationId: 'CC',
  potentialMatches: [
    {
      firstName: 'James',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
      prisonNumber: 'A1234BC',
      pncNumber: '11/5678',
      croNumber: '12/0000',
      sex: SexKeys.MALE,
    },
    {
      firstName: 'Jim',
      lastName: 'Smith',
      dateOfBirth: '1983-01-08',
      sex: SexKeys.MALE,
    },
  ],
}
let app: Express

beforeEach(() => {
  config.confirmNoIdentifiersEnabled = true
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getArrival.mockResolvedValue(arrival)
  expectedArrivalsService.getPrisonerDetails.mockResolvedValue(arrival.potentialMatches[0])
  flashProvider.mockReturnValue([])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('possible records found', () => {
  describe('view', () => {
    it('should call service method correctly', () => {
      return request(app)
        .get(`/prisoners/${arrival.id}/possible-records-found`)
        .expect(() => {
          expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith(arrival.id)
        })
    })

    it('should render page correctly', () => {
      return request(app)
        .get(`/prisoners/${arrival.id}/possible-records-found`)
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Possible existing records have been found')
        })
    })
  })

  describe('submit', () => {
    it('should redirect if errors', () => {
      return request(app)
        .post('/prisoners/12345-67890/possible-records-found')
        .send()
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/possible-records-found')
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', [
            {
              text: 'Select an existing record or search using different details',
              href: '#record-1',
            },
          ])
        })
    })

    it('should redirect to /sex page if no errors', () => {
      return request(app)
        .post('/prisoners/12345-67890/possible-records-found')
        .send({ prisonNumber: arrival.prisonNumber })
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/sex')
        .expect(req => {
          expect(flashProvider).not.toHaveBeenCalled()
          expect(expectedArrivalsService.getPrisonerDetails).toHaveBeenCalledWith('A1234BC')
          expectSettingCookie(req, State.newArrival).toStrictEqual({
            dateOfBirth: '1973-01-08',
            expected: 'true',
            firstName: 'James',
            lastName: 'Smyth',
            pncNumber: '11/5678',
            prisonNumber: 'A1234BC',
            sex: 'MALE',
          })
        })
    })
  })
})
