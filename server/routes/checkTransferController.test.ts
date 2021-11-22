import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes } from './testutils/appSetup'
import ExpectedArrivalsService, { LocationType } from '../services/expectedArrivalsService'

import Role from '../authentication/role'

jest.mock('../services/expectedArrivalsService')
const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
let app: Express

const expectedTransfers = new Map()
expectedTransfers.set(LocationType.PRISON, [
  {
    firstName: 'Karl',
    lastName: 'Offender',
    dateOfBirth: '1985-01-01',
    prisonNumber: 'A1234AB',
    pncNumber: '01/5678A',
    date: '2021-09-01',
    fromLocation: 'Leeds',
    moveType: 'PRISON_TRANSFER',
  },
])

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getArrivalsForToday.mockResolvedValue(expectedTransfers)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET checkTransfer', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/A1234AB/check-transfer').expect(302).expect('Location', '/autherror')
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners/A1234AB/check-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getArrivalsForToday).toHaveBeenCalledTimes(1)
        expect(expectedArrivalsService.getArrivalsForToday).toHaveBeenCalledWith('MDI')
      })
  })

  it('should render the correct data in /check-transfer page', () => {
    return request(app)
      .get('/prisoners/A1234AB/check-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Check this record matches the person in reception')
        expect($('[data-qa = "prisoner-name"]').text()).toContain('Karl Offender')
        expect($('[data-qa = "dob"]').text()).toContain('1 January 1985')
        expect($('[data-qa = "prison-number"]').text()).toContain('A1234AB')
        expect($('[data-qa = "pnc-number"]').text()).toContain('01/5678A')
        expect($('[data-qa = "add-to-roll"]').text()).toContain('Add to the establishment roll')
        expect(res.text).toContain('/prisoners/A1234AB/check-transfer')
      })
  })
})
