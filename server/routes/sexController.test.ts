import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { GenderKeys, Movement } from 'welcome'
import { appWithAllRoutes } from './testutils/appSetup'
import ImprisonmentStatusesService from '../services/imprisonmentStatusesService'
import ExpectedArrivalsService from '../services/expectedArrivalsService'
import Role from '../authentication/role'

jest.mock('../services/imprisonmentStatusesService')
jest.mock('../services/expectedArrivalsService')

const imprisonmentStatusesService = new ImprisonmentStatusesService(
  null,
  null
) as jest.Mocked<ImprisonmentStatusesService>

const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>

let app: Express

const flash = jest.fn()

beforeEach(() => {
  app = appWithAllRoutes({
    services: { imprisonmentStatusesService, expectedArrivalsService },
    flash,
    roles: [Role.PRISON_RECEPTION],
  })
  expectedArrivalsService.getArrival.mockResolvedValue({} as Movement)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('/sex', () => {
  describe('view()', () => {
    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ roles: [] })
      return request(app).get('/prisoners/12345-67890/sex').expect(302).expect('Location', '/autherror')
    })

    it.each([{ gender: GenderKeys.NOT_KNOWN }, { gender: undefined }])(
      'should render /sex page when Arrival gender is not MALE or FEMALE',
      ({ gender }) => {
        expectedArrivalsService.getArrival.mockResolvedValue({ gender } as Movement)
        return request(app)
          .get('/prisoners/12345-67890/sex')
          .expect(200)
          .expect('Content-Type', 'text/html; charset=utf-8')
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('h1').text()).toContain('What is their sex?')
          })
      }
    )

    it.each([{ gender: GenderKeys.MALE }, { gender: GenderKeys.FEMALE }])(
      'should render /imprisonment-status page when Arrival gender is MALE or FEMALE',
      ({ gender }) => {
        expectedArrivalsService.getArrival.mockResolvedValue({ gender } as Movement)
        return request(app)
          .get('/prisoners/12345-67890/sex')
          .expect(302)
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect(res => {
            expect(res.text).toContain('Found. Redirecting to /prisoners/12345-67890/imprisonment-status')
          })
      }
    )
  })

  describe('assignSex()', () => {
    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ roles: [] })
      return request(app).get('/prisoners/12345-67890/sex').expect(302).expect('Location', '/autherror')
    })

    it('should call flash and redirect back to /sex body is undefined', () => {
      return request(app)
        .post('/prisoners/12345-67890/sex')
        .send({ sex: undefined })
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/sex')
        .expect(() => {
          expect(flash.mock.calls).toEqual([['errors', [{ href: '#sex', text: 'Select a sex' }]]])
        })
    })

    it('should set cookie', () => {
      return request(app)
        .post('/prisoners/12345-67890/sex')
        .send({ sex: 'M' })
        .expect(302)
        .expect(res => {
          expect(res.header['set-cookie'][0]).toContain(encodeURIComponent('M'))
        })
    })

    it('should redirect to /imprisonment-status', () => {
      return request(app)
        .post('/prisoners/12345-67890/sex')
        .send({ sex: 'M' })
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/imprisonment-status')
    })
  })
})
