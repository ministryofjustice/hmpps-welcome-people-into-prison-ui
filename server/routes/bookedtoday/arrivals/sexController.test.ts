import { GenderKeys, type Arrival } from 'welcome'
import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../__testutils/appSetup'
import ImprisonmentStatusesService from '../../../services/imprisonmentStatusesService'
import ExpectedArrivalsService from '../../../services/expectedArrivalsService'
import Role from '../../../authentication/role'

jest.mock('../../../services/imprisonmentStatusesService')
jest.mock('../../../services/expectedArrivalsService')

const imprisonmentStatusesService = new ImprisonmentStatusesService(
  null,
  null
) as jest.Mocked<ImprisonmentStatusesService>

const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: { imprisonmentStatusesService, expectedArrivalsService },
    roles: [Role.PRISON_RECEPTION],
  })
  expectedArrivalsService.getArrival.mockResolvedValue({} as Arrival)
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

    it.each([{ gender: 'blas' as GenderKeys }, { gender: undefined }, { gender: GenderKeys.TRANS }])(
      'should render /sex page when Arrival gender is not MALE or FEMALE',
      ({ gender }) => {
        expectedArrivalsService.getArrival.mockResolvedValue({ gender } as Arrival)
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
        expectedArrivalsService.getArrival.mockResolvedValue({ gender } as Arrival)
        return request(app)
          .get('/prisoners/12345-67890/sex')
          .expect(302)
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect(res.text).toContain('Found. Redirecting to /prisoners/12345-67890/imprisonment-status')
            expect($('.govuk-inset-text').text()).not.toContain(
              'was identified as transgender on their Person Escort Record. Their registered sex at birth is required to confirm their arrival into this establishment.'
            )
          })
      }
    )

    it('contains additional hint for TRANS response', () => {
      expectedArrivalsService.getArrival.mockResolvedValue({
        gender: GenderKeys.TRANS,
        firstName: 'john',
        lastName: 'smith',
      } as Arrival)
      return request(app)
        .get('/prisoners/12345-67890/sex')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.govuk-inset-text').text()).toContain(
            'john smith was identified as transgender on their Person Escort Record. Their registered sex at birth is required to confirm their arrival into this establishment.'
          )
        })
    })
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
          expect(flashProvider.mock.calls).toEqual([['errors', [{ href: '#sex', text: 'Select a sex' }]]])
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
