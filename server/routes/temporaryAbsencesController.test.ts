import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, user } from './testutils/appSetup'
import TemporaryAbsencesService from '../services/temporaryAbsencesService'
import Role from '../authentication/role'

jest.mock('../services/temporaryAbsencesService')

const temporaryAbsencesService = new TemporaryAbsencesService(null, null) as jest.Mocked<TemporaryAbsencesService>

let app: Express

const temporaryAbsences = [
  {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1971-01-01',
    prisonNumber: 'G0013AB',
    reasonForAbsence: 'Hospital appointment',
  },
  {
    firstName: 'Karl',
    lastName: 'Offender',
    dateOfBirth: '1985-01-01',
    prisonNumber: 'G0015GD',
    reasonForAbsence: 'Hospital appointment',
  },
  {
    firstName: 'Mark',
    lastName: 'Prisoner',
    dateOfBirth: '1985-01-05',
    prisonNumber: 'G0016GD',
    reasonForAbsence: 'Hospital appointment',
  },
  {
    firstName: 'Barry',
    lastName: 'Smith',
    dateOfBirth: '1970-01-01',
    prisonNumber: 'G0012HK',
    reasonForAbsence: 'External visit',
  },
]

beforeEach(() => {
  app = appWithAllRoutes({ services: { temporaryAbsencesService }, roles: [Role.RECEPTION_USER] })
  temporaryAbsencesService.getTemporaryAbsences.mockResolvedValue(temporaryAbsences)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /confirm-arrival/return-from-temporary-absence', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .get('/confirm-arrival/return-from-temporary-absence')
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should render /confirm-arrival/return-from-temporary-absence page', () => {
    return request(app)
      .get('/confirm-arrival/return-from-temporary-absence')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Select prisoner returning from temporary absence')
      })
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/confirm-arrival/return-from-temporary-absence')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(temporaryAbsencesService.getTemporaryAbsences).toHaveBeenCalledWith(user.activeCaseLoadId)
      })
  })
})
