import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { type Arrival, GenderKeys } from 'welcome'
import { appWithAllRoutes } from '../../__testutils/appSetup'
import ExpectedArrivalsService, { LocationType } from '../../../services/expectedArrivalsService'
import Role from '../../../authentication/role'

jest.mock('../../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getArrival.mockResolvedValue({
    id: '1111-2222-3333-4444',
    firstName: 'James',
    lastName: 'Smyth',
    dateOfBirth: '1973-01-08',
    prisonNumber: 'A1234AB',
    pncNumber: '01/98644M',
    date: '2021-09-01',
    fromLocation: 'Reading',
    moveType: 'PRISON_REMAND',
    fromLocationType: LocationType.COURT,
    gender: GenderKeys.MALE,
    isCurrentPrisoner: false,
    potentialMatches: [],
  } as Arrival)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /view', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/12345-67890/no-record-found').expect(302).expect('Location', '/autherror')
  })

  it('should display correct page heading', () => {
    return request(app)
      .get('/prisoners/12345-67890/no-record-found')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('This person does not have an existing prisoner record')
        expect($('.data-qa-per-record-prisoner-name').text()).toContain('James Smyth')
        expect($('.data-qa-per-record-dob').text()).toContain('8 January 1973')
        expect($('.data-qa-per-record-prison-number').text()).toContain('A1234AB')
        expect($('.data-qa-per-record-pnc-number').text()).toContain('01/98644M')
        expect($('[data-qa = "continue"]').text()).toContain('Continue')
      })
  })
})
