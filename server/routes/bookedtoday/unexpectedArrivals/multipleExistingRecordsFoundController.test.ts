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
const expectedArrivalsService = new ExpectedArrivalsService(null, null, null) as jest.Mocked<ExpectedArrivalsService>

const searchDetails = {
  firstName: 'Jim',
  lastName: 'Smith',
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
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('possible records found', () => {
  describe('view', () => {
    it('should call service method correctly', () => {
      stubCookie(State.searchDetails, searchDetails)
      return request(app)
        .get('/manually-confirm-arrival/search-for-existing-record/possible-records-found')
        .expect(() => {
          expect(expectedArrivalsService.getMatchingRecords).toHaveBeenCalledWith(searchDetails)
        })
    })

    it('should display partial prisoner name', () => {
      stubCookie(State.searchDetails, {
        firstName: undefined,
        lastName: 'Smith',
        dateOfBirth: '1973-01-08',
        prisonNumber: 'A1234BC',
        pncNumber: '11/5678',
      })

      return request(app)
        .get('/manually-confirm-arrival/search-for-existing-record/possible-records-found')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Possible existing records have been found')
          expect($('.data-qa-arrival-details-prisoner-name').text()).toContain('Smith')
          expect($('.data-qa-arrival-details-prisoner-name').text()).not.toContain('undefined')
        })
    })
    it('should display alternative search text for name and date of birth', () => {
      stubCookie(State.searchDetails, {
        firstName: undefined,
        lastName: undefined,
        dateOfBirth: undefined,
        prisonNumber: 'A1234BC',
        pncNumber: '11/5678',
      })

      return request(app)
        .get('/manually-confirm-arrival/search-for-existing-record/possible-records-found')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.data-qa-arrival-details-prisoner-name').text()).toContain('Not entered')
          expect($('.data-qa-arrival-details-dob').text()).toContain('Not entered')
        })
    })
    it('should display alternative search text for prison and pnc', () => {
      stubCookie(State.searchDetails, {
        firstName: 'Jim',
        lastName: 'Smith',
        dateOfBirth: '1983-01-08',
        prisonNumber: undefined,
        pncNumber: undefined,
      })

      return request(app)
        .get('/manually-confirm-arrival/search-for-existing-record/possible-records-found')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.data-qa-arrival-details-prison-number').text()).toContain('Not entered')
          expect($('.data-qa-arrival-details-pnc-number').text()).toContain('Not entered')
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
