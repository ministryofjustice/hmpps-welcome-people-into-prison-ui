import type { Express } from 'express'
import request from 'supertest'
import { SexKeys } from 'welcome'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider, stubCookie } from '../../__testutils/appSetup'

import Role from '../../../authentication/role'
import { ExpectedArrivalsService } from '../../../services'
import { State } from '../arrivals/state'
import { expectSettingCookie } from '../../__testutils/requestTestUtils'

jest.mock('../../../services/expectedArrivalsService')
const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>

const searchDetails = {
  firstName: 'Jamie',
  lastName: 'Smyth',
  dateOfBirth: '1973-01-08',
}

const potentialMatches = [
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
]
let app: Express

beforeEach(() => {
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
        .get('/manually-confirm-arrival/search-for-existing-record/possible-records-found')
        .expect(() => {
          expect(expectedArrivalsService.getMatchingRecords).toHaveBeenCalledWith(searchDetails)
        })
    })

    it('should render page correctly', () => {
      return request(app)
        .get('/manually-confirm-arrival/search-for-existing-record/possible-records-found')
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
        .post('/manually-confirm-arrival/search-for-existing-record/possible-records-found')
        .send()
        .expect(302)
        .expect('Location', '/manually-confirm-arrival/search-for-existing-record/possible-records-found')
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
        .post('/manually-confirm-arrival/search-for-existing-record/possible-records-found')
        .send({ prisonNumber: potentialMatches[0].prisonNumber })
        .expect(302)
        .expect('Location', '/prisoners/unexpected-arrivals/sex')
        .expect(res => {
          expect(flashProvider).not.toHaveBeenCalled()
          expect(expectedArrivalsService.getPrisonerDetails).toHaveBeenCalledWith('A1234BC')
          expectSettingCookie(res, State.newArrival).toStrictEqual({
            dateOfBirth: '1973-01-08',
            expected: 'false',
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
