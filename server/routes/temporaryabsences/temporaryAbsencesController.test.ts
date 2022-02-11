import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, user } from '../__testutils/appSetup'
import TemporaryAbsencesService from '../../services/temporaryAbsencesService'
import Role from '../../authentication/role'

jest.mock('../../services/temporaryAbsencesService')

const temporaryAbsencesService = new TemporaryAbsencesService(null, null) as jest.Mocked<TemporaryAbsencesService>

let app: Express

const temporaryAbsences = [
  {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1971-01-01',
    prisonNumber: 'G0013AB',
    reasonForAbsence: 'Hospital appointment',
    movementDateTime: '2022-01-17T14:20:00',
  },
  {
    firstName: 'Karl',
    lastName: 'Offender',
    dateOfBirth: '1985-01-01',
    prisonNumber: 'G0015GD',
    reasonForAbsence: 'Hospital appointment',
    movementDateTime: '2022-01-05T10:20:00',
  },
  {
    firstName: 'Mark',
    lastName: 'Prisoner',
    dateOfBirth: '1985-01-05',
    prisonNumber: 'G0016GD',
    reasonForAbsence: 'Hospital appointment',
    movementDateTime: '2022-01-10T15:00:00',
  },
  {
    firstName: 'Barry',
    lastName: 'Smith',
    dateOfBirth: '1970-01-01',
    prisonNumber: 'G0012HK',
    reasonForAbsence: 'External visit',
    movementDateTime: '2022-01-16T12:30:00',
  },
]

beforeEach(() => {
  app = appWithAllRoutes({ services: { temporaryAbsencesService }, roles: [Role.PRISON_RECEPTION] })
  temporaryAbsencesService.getTemporaryAbsences.mockResolvedValue(temporaryAbsences)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoners-returning', () => {
  it('should render /prisoners-returning page', () => {
    return request(app)
      .get('/prisoners-returning')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Select prisoner returning from temporary absence')
        expect($('.app-card-wrapper')).toHaveLength(4)
        expect($('#no-prisoners').text()).toContain('')
      })
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners-returning')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(temporaryAbsencesService.getTemporaryAbsences).toHaveBeenCalledWith(user.activeCaseLoadId)
      })
  })

  it('should display alternative text if no prisoners to display', () => {
    temporaryAbsencesService.getTemporaryAbsences.mockResolvedValue([])

    return request(app)
      .get('/prisoners-returning')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.app-card-wrapper')).toHaveLength(0)
        expect($('#no-prisoners').text()).toContain('There are currently no prisoners out on temporary absence.')
      })
  })
})
