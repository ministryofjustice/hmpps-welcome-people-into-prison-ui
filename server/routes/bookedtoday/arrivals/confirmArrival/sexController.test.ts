import { GenderKeys } from 'welcome'
import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, signedCookiesProvider, flashProvider } from '../../../__testutils/appSetup'
import { expectSettingCookie } from '../../../__testutils/requestTestUtils'
import Role from '../../../../authentication/role'

let app: Express

beforeEach(() => {
  signedCookiesProvider.mockReturnValue({
    'new-arrival': {
      firstName: 'Jim',
      lastName: 'Smith',
      dateOfBirth: '1973-01-08',
      sex: 'M',
    },
  })
  app = appWithAllRoutes({
    roles: [Role.PRISON_RECEPTION],
  })
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

    it.each([{ sex: 'blas' as GenderKeys }, { sex: undefined }, { sex: GenderKeys.TRANS }])(
      'should render /sex page when new-arrival sex is not MALE or FEMALE',
      ({ sex }) => {
        signedCookiesProvider.mockReturnValue({
          'new-arrival': {
            firstName: 'Jim',
            lastName: 'Smith',
            dateOfBirth: '1973-01-08',
            sex,
          },
        })
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

    it.each([{ sex: GenderKeys.MALE }, { sex: 'M' }, { sex: GenderKeys.FEMALE }, { sex: 'F' }])(
      'should render /imprisonment-status page when Arrival gender is MALE or FEMALE',
      ({ sex }) => {
        signedCookiesProvider.mockReturnValue({
          'new-arrival': {
            firstName: 'Jim',
            lastName: 'Smith',
            dateOfBirth: '1973-01-08',
            sex,
          },
        })
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
      signedCookiesProvider.mockReturnValue({
        'new-arrival': {
          firstName: 'Jim',
          lastName: 'Smith',
          dateOfBirth: '1973-01-08',
          sex: GenderKeys.TRANS,
        },
      })
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

    it('should update cookie', () => {
      return request(app)
        .post('/prisoners/12345-67890/sex')
        .send({ sex: 'M' })
        .expect(302)
        .expect(res => {
          expectSettingCookie(res, 'new-arrival').toStrictEqual({
            firstName: 'Jim',
            lastName: 'Smith',
            dateOfBirth: '1973-01-08',
            sex: 'M',
          })
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
