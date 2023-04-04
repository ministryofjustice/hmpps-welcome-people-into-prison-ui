import { SexKeys } from 'welcome'
import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider, stubCookie } from '../../../__testutils/appSetup'
import { expectSettingCookie } from '../../../__testutils/requestTestUtils'
import Role from '../../../../authentication/role'
import { State } from '../state'
import { createNewArrival } from '../../../../data/__testutils/testObjects'
import { createLockManager } from '../../../../data/__testutils/mocks'

let app: Express
const lockManager = createLockManager()
const newArrival = createNewArrival()

beforeEach(() => {
  stubCookie(State.newArrival, newArrival)
  lockManager.getLockStatus.mockResolvedValue(false)

  app = appWithAllRoutes({ services: { lockManager }, roles: [Role.PRISON_RECEPTION] })
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

    it('should redirect to /duplicate-booking-prevention if arrival already confirmed', () => {
      lockManager.getLockStatus.mockResolvedValue(true)
      app = appWithAllRoutes({
        services: { lockManager },
        roles: [Role.PRISON_RECEPTION],
      })
      return request(app)
        .get('/prisoners/12345-67890/sex')
        .expect(302)
        .expect('Location', '/duplicate-booking-prevention')
    })

    it.each([{ sex: 'blas' as SexKeys }, { sex: undefined }, { sex: 'TRANS' }])(
      'should render /sex page when new-arrival sex is not MALE or FEMALE',
      ({ sex }) => {
        stubCookie(State.newArrival, { ...newArrival, sex })
        return request(app)
          .get('/prisoners/12345-67890/sex')
          .expect(200)
          .expect('Content-Type', 'text/html; charset=utf-8')
          .expect(res => {
            const $ = cheerio.load(res.text)
            expect($('h1').text()).toContain(`What is Jim Smith's sex?`)
          })
      }
    )

    it.each([{ sex: 'MALE' }, { sex: 'M' }, { sex: 'FEMALE' }, { sex: 'F' }])(
      'should render /imprisonment-status page when Arrival sex is MALE or FEMALE',
      ({ sex }) => {
        stubCookie(State.newArrival, { ...newArrival, sex })
        return request(app)
          .get('/prisoners/12345-67890/sex')
          .expect(302)
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect('Location', '/prisoners/12345-67890/imprisonment-status')
      }
    )

    it('contains additional hint for TRANS response', () => {
      stubCookie(State.newArrival, { ...newArrival, sex: 'TRANS' })
      return request(app)
        .get('/prisoners/12345-67890/sex')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.govuk-inset-text').text()).toContain(
            'Jim Smith was identified as transgender on their Person Escort Record. Their registered sex at birth is required to confirm their arrival into this establishment.'
          )
        })
    })
  })

  describe('POST /sex', () => {
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

    it('should update cookie', () => {
      return request(app)
        .post('/prisoners/12345-67890/sex')
        .send({ sex: 'M' })
        .expect(302)
        .expect(res => {
          expectSettingCookie(res, State.newArrival).toStrictEqual({ ...newArrival, sex: 'M', expected: 'true' })
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
