import type { Arrival } from 'welcome'
import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../__testutils/appSetup'
import { ExpectedArrivalsService } from '../../../services'
import Role from '../../../authentication/role'

jest.mock('../../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getArrival.mockResolvedValue(null)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /confirmArrival', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/12345-67890/confirm-arrival').expect(302).expect('Location', '/autherror')
  })

  it('should retrieve location from flash', () => {
    flashProvider.mockReturnValue([{ location: 'Reception' }])
    return request(app)
      .get('/prisoners/12345-67890/confirm-arrival')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('location')
      })
  })

  it('should call service method correctly', () => {
    flashProvider.mockReturnValue([{ location: 'Reception' }])
    return request(app)
      .get('/prisoners/12345-67890/confirm-arrival')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('12345-67890')
      })
  })

  it('should clear cookie', () => {
    flashProvider.mockReturnValue([{ location: 'Reception' }])
    return request(app)
      .get('/prisoners/12345-67890/confirm-arrival')
      .expect(res => {
        expect(res.header['set-cookie'][0]).not.toContain('code')
        expect(res.header['set-cookie'][0]).not.toContain('imprisonmentStatus')
        expect(res.header['set-cookie'][0]).not.toContain('movementReasonCode')
      })
  })

  it('should display correct page heading when there is NOT an existing prisoner record', () => {
    flashProvider.mockReturnValue([{ location: 'Reception' }])
    expectedArrivalsService.getArrival.mockResolvedValue({
      firstName: 'James',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
      prisonNumber: 'A1234AB',
      pncNumber: '99/98644M',
      potentialMatches: [],
    } as Arrival)

    return request(app)
      .get('/prisoners/12345-67890/confirm-arrival')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('This person does not have an existing prisoner record')
      })
  })
  it('should display correct page heading when there IS an existing record', () => {
    expectedArrivalsService.getArrival.mockResolvedValue({
      firstName: 'James',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
      prisonNumber: 'A1234AB',
      pncNumber: '99/98644M',
      potentialMatches: [
        {
          firstName: 'Jim',
          lastName: 'Smyth',
          dateOfBirth: '1973-01-08',
          prisonNumber: 'A00000BC',
          pncNumber: '99/98644M',
        },
      ],
    } as Arrival)

    flashProvider.mockReturnValue([{ location: 'Reception' }])
    return request(app)
      .get('/prisoners/12345-67890/confirm-arrival')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('This person has an existing prisoner record')
      })
  })
})
