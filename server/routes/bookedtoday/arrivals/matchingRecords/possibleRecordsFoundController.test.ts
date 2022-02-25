import type { Express } from 'express'
import request from 'supertest'
import { GenderKeys } from 'welcome'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider, signedCookiesProvider } from '../../../__testutils/appSetup'

import Role from '../../../../authentication/role'
import config from '../../../../config'
import { ExpectedArrivalsService } from '../../../../services'

jest.mock('../../../../services/expectedArrivalsService')
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
    sex: GenderKeys.MALE,
  },
  {
    firstName: 'Jim',
    lastName: 'Smith',
    dateOfBirth: '1983-01-08',
    sex: GenderKeys.MALE,
  },
]
let app: Express

beforeEach(() => {
  config.confirmNoIdentifiersEnabled = true
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getMatchingRecords.mockResolvedValue(potentialMatches)
  expectedArrivalsService.getPrisonerDetails.mockResolvedValue(potentialMatches[0])
  flashProvider.mockReturnValue([])
  signedCookiesProvider.mockReturnValue({ 'search-details': searchDetails })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('possible records found', () => {
  describe('view', () => {
    it('should get search details from state', () => {
      return request(app)
        .get('/prisoners/12345-67890/possible-records-found')
        .expect(() => {
          expect(signedCookiesProvider).toHaveBeenCalledTimes(1)
        })
    })

    it('should call service method correctly', () => {
      return request(app)
        .get('/prisoners/12345-67890/possible-records-found')
        .expect(() => {
          expect(expectedArrivalsService.getMatchingRecords).toHaveBeenCalledWith(searchDetails)
        })
    })

    it('should render page correctly', () => {
      return request(app)
        .get('/prisoners/12345-67890/possible-records-found')
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
        .send(potentialMatches[0])
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/sex')
        .expect(() => {
          expect(flashProvider).not.toHaveBeenCalled()
          expect(expectedArrivalsService.getPrisonerDetails).toHaveBeenCalledWith('A1234BC')
          expect(signedCookiesProvider).toHaveBeenCalledTimes(1)
        })
    })
  })
})