 00import type { Express } from 'express'
import type { PotentialMatch } from 'welcome'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../__testutils/appSetup'
import Role from '../../../authentication/role'
import config from '../../../config'
import * as State from '../arrivals/state'
import { createMockExpectedArrivalsService } from '../../../services/__testutils/mocks'
import { createPotentialMatch } from '../../../data/__testutils/testObjects'

jest.mock('../arrivals/state')

let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()

const searchInputDetails = {
  firstName: 'James',
  lastName: 'Smyth',
  day: '08',
  month: '01',
  year: '1973',
  prisonNumber: 'A1234AB',
  pncNumber: '99/55555M',
}
const potentialMatches: PotentialMatch[] = [
  createPotentialMatch({
    firstName: 'James',
    lastName: 'Smyth',
    dateOfBirth: '1973-01-08',
    prisonNumber: 'A1234BC',
    pncNumber: '11/5678',
    croNumber: '12/0000',
  }),
  createPotentialMatch({
    firstName: 'Jim',
    lastName: 'Smith',
    dateOfBirth: '1983-01-08',
  }),
]

beforeEach(() => {
  config.confirmNoIdentifiersEnabled = true
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getArrival.mockResolvedValue(null)
  expectedArrivalsService.getMatchingRecords.mockResolvedValue([])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Unexpected arrivals - search for existing records', () => {
  describe('GET /manually-confirm-arrival/search-for-existing-record', () => {
    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ roles: [] })
      return request(app)
        .get('/manually-confirm-arrival/search-for-existing-record')
        .expect(302)
        .expect('Location', '/autherror')
    })

    it('should render page', () => {
      flashProvider.mockReturnValue([])

      return request(app)
        .get('/manually-confirm-arrival/search-for-existing-record')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Search for an existing prisoner record')
        })
    })

    it('should call flash once for errors and once for data', () => {
      const flash = flashProvider.mockReturnValue([])

      return request(app)
        .get('/manually-confirm-arrival/search-for-existing-record')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(flash).toBeCalledTimes(2)
        })
    })
  })

  describe('POST /manually-confirm-arrival/search-for-existing-record', () => {
    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ roles: [] })
      return request(app)
        .post('/manually-confirm-arrival/search-for-existing-record')
        .send({})
        .expect(302)
        .expect('Location', '/autherror')
    })

    it('should call flash twice if errors and redirect', () => {
      const search = {
        firstName: 'James',
        lastName: 'Smith',
        day: '',
        month: '01',
        year: '1973',
        prisonNumber: 'A1234AB',
        pncNumber: '99/55555M',
      }
      return request(app)
        .post('/manually-confirm-arrival/search-for-existing-record')
        .send(search)
        .expect(302)
        .expect('Location', '/manually-confirm-arrival/search-for-existing-record')
        .expect(() => {
          expect(flashProvider.mock.calls).toEqual([
            ['errors', [{ href: '#date-of-birth-day', text: 'Date of birth must include a day' }]],
            [
              'input',
              {
                day: '',
                firstName: 'James',
                lastName: 'Smith',
                month: '01',
                pncNumber: '99/55555M',
                prisonNumber: 'A1234AB',
                year: '1973',
              },
            ],
          ])
        })
    })

    it('should use correct details to get matched records', () => {
      return request(app)
        .post('/manually-confirm-arrival/search-for-existing-record')
        .send(searchInputDetails)
        .expect(() => {
          expect(expectedArrivalsService.getMatchingRecords).toHaveBeenCalledWith({
            firstName: 'James',
            lastName: 'Smyth',
            dateOfBirth: '1973-01-08',
            prisonNumber: 'A1234AB',
            pncNumber: '99/55555M',
          })
        })
    })

    it('can perform prison number search', () => {
      return request(app)
        .post('/manually-confirm-arrival/search-for-existing-record')
        .send({ prisonNumber: 'A1234AA', day: '', month: '', year: '' })
        .expect(302)
        .expect(() => {
          expect(expectedArrivalsService.getMatchingRecords).toHaveBeenCalledWith({
            prisonNumber: 'A1234AA',
          })
        })
    })

    it('should redirect to /no-record-found', () => {
      return request(app)
        .post('/manually-confirm-arrival/search-for-existing-record')
        .send(searchInputDetails)
        .expect(302)
        .expect('Location', '/manually-confirm-arrival/search-for-existing-record/no-record-found')
    })

    it('should redirect to /record-found', () => {
      expectedArrivalsService.getMatchingRecords.mockResolvedValue([potentialMatches[0]])

      return request(app)
        .post('/manually-confirm-arrival/search-for-existing-record')
        .send(searchInputDetails)
        .expect(302)
        .expect('Location', '/manually-confirm-arrival/search-for-existing-record/record-found')
    })

    it('should redirect to /possible-records-found', () => {
      expectedArrivalsService.getMatchingRecords.mockResolvedValue(potentialMatches)

      return request(app)
        .post('/manually-confirm-arrival/search-for-existing-record')
        .send(searchInputDetails)
        .expect(302)
        .expect('Location', '/manually-confirm-arrival/search-for-existing-record/possible-records-found')
    })

    it('should clear newArrival state', () => {
      return request(app)
        .post('/manually-confirm-arrival/search-for-existing-record')
        .send(searchInputDetails)
        .expect(() => {
          expect(State.State.newArrival.clear).toBeCalledTimes(1)
        })
    })
  })
})
