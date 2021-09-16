import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { user, appWithAllRoutes } from './testutils/appSetup'
import IncomingMovementsService from '../services/incomingMovementsService'

jest.mock('../services/incomingMovementsService')

const incomingMovementsService = new IncomingMovementsService(null, null) as jest.Mocked<IncomingMovementsService>

let app: Express

const incomingMovementsGroupedByType = new Map()
incomingMovementsGroupedByType.set('FROM_COURT', [
  {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1971-01-01',
    prisonNumber: 'G0013AB',
    pncNumber: '01/3456A',
    date: '2021-09-01',
    fromLocation: 'Reading',
    moveType: 'PRISON_REMAND',
  },
  {
    firstName: 'Sam',
    lastName: 'Smith',
    dateOfBirth: '1970-02-01',
    prisonNumber: 'G0014GM',
    pncNumber: '01/4567A',
    date: '2021-09-01',
    fromLocation: 'Leeds',
    moveType: 'PRISON_REMAND',
  },
])
incomingMovementsGroupedByType.set('OTHER', [
  {
    firstName: 'Karl',
    lastName: 'Offender',
    dateOfBirth: '1985-01-01',
    prisonNumber: 'G0015GD',
    pncNumber: '01/5678A',
    date: '2021-09-01',
    fromLocation: 'Leeds',
    moveType: 'PRISON_TRANSFER',
  },
])
incomingMovementsGroupedByType.set('FROM_CUSTODY_SUITE', [
  {
    firstName: 'Mark',
    lastName: 'Prisoner',
    dateOfBirth: '1985-01-05',
    prisonNumber: 'G0016GD',
    pncNumber: '01/6789A',
    date: '2021-09-01',
    fromLocation: 'Coventry',
    moveType: 'PRISON_RECALL',
  },
  {
    firstName: 'Barry',
    lastName: 'Smith',
    dateOfBirth: '1970-01-01',
    prisonNumber: 'G0012HK',
    pncNumber: '01/2345A',
    date: '2021-09-01',
    fromLocation: 'Sheffield',
    moveType: 'PRISON_RECALL',
  },
  {
    firstName: 'Bob',
    lastName: 'Smith',
    dateOfBirth: '1970-01-01',
    prisonNumber: 'G0012BK',
    pncNumber: '01/2345A',
    date: '2021-09-01',
    fromLocation: 'Wandsworth',
    moveType: 'VIDEO_REMAND',
  },
])

beforeEach(() => {
  app = appWithAllRoutes({ services: { incomingMovementsService } })
  incomingMovementsService.getMovesForToday.mockResolvedValue(incomingMovementsGroupedByType)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /confirm-arrival/choose-prisoner', () => {
  it('should render /confirm-arrival/choose-prisoner page', () => {
    return request(app)
      .get('/confirm-arrival/choose-prisoner')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Select prisoner to add to the establishment roll')
      })
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/confirm-arrival/choose-prisoner')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(incomingMovementsService.getMovesForToday).toHaveBeenCalledWith(user.activeCaseLoadId)
      })
  })
})
