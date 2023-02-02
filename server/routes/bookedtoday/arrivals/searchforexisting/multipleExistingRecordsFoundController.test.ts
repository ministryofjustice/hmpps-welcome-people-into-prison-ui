import type { Express } from 'express'
import type { PotentialMatch } from 'welcome'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider, stubCookie } from '../../../__testutils/appSetup'

import Role from '../../../../authentication/role'
import config from '../../../../config'
import { expectSettingCookie } from '../../../__testutils/requestTestUtils'
import { State } from '../state'
import { createMockExpectedArrivalsService } from '../../../../services/__testutils/mocks'
import { createPotentialMatch } from '../../../../data/__testutils/testObjects'

const searchDetails = {
  firstName: 'Jamie',
  lastName: 'Smyth',
  dateOfBirth: '1973-01-08',
}
const potentialMatches: PotentialMatch[] = [
  createPotentialMatch({
    firstName: 'James',
    lastName: 'Smyth',
    dateOfBirth: '1973-01-08',
    prisonNumber: 'A1234BC',
    pncNumber: '11/5678',
  }),
  createPotentialMatch({
    firstName: 'Jim',
    lastName: 'Smith',
    prisonNumber: 'A1234AB',
    dateOfBirth: '1983-01-08',
    sex: 'MALE',
  }),
]
let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()

beforeEach(() => {
  config.confirmNoIdentifiersEnabled = true
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getMatchingRecords.mockResolvedValue(potentialMatches)
  expectedArrivalsService.getPrisonerDetails.mockResolvedValue(potentialMatches[0])
  flashProvider.mockReturnValue([])
  stubCookie(State.searchDetails, searchDetails)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('possible records found', () => {
  describe('view', () => {
    it('should call service method correctly', () => {
      return request(app)
        .get('/prisoners/12345-67890/search-for-existing-record/possible-records-found')
        .expect(() => {
          expect(expectedArrivalsService.getMatchingRecords).toHaveBeenCalledWith(searchDetails)
        })
    })

    it('should render page correctly', () => {
      return request(app)
        .get('/prisoners/12345-67890/search-for-existing-record/possible-records-found')
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
        .post('/prisoners/12345-67890/search-for-existing-record/possible-records-found')
        .send()
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/search-for-existing-record/possible-records-found')
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', [
            {
              text: 'Select an existing record or search using different details',
              href: '#record-1',
            },
          ])
        })
    })

    it('should redirect to /start-confirmation page if no errors', () => {
      return request(app)
        .post('/prisoners/12345-67890/search-for-existing-record/possible-records-found')
        .send({ prisonNumber: potentialMatches[0].prisonNumber })
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/start-confirmation')
        .expect(res => {
          expect(flashProvider).not.toHaveBeenCalled()
          expect(expectedArrivalsService.getPrisonerDetails).toHaveBeenCalledWith('A1234BC')
          expectSettingCookie(res, State.newArrival).toStrictEqual({
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
