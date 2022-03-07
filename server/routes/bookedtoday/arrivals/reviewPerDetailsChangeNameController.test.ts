import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, signedCookiesProvider, flashProvider } from '../../__testutils/appSetup'
import Role from '../../../authentication/role'
import config from '../../../config'
import { expectSettingCookie } from '../../__testutils/requestTestUtils'

let app: Express

const newArrival = {
  firstName: 'James',
  lastName: 'Smyth',
  dateOfBirth: '1973-01-08',
  sex: 'MALE',
  pncNumber: '99/98644M',
  prisonNumber: 'A1234AB',
}

beforeEach(() => {
  config.confirmNoIdentifiersEnabled = true
  app = appWithAllRoutes({ roles: [Role.PRISON_RECEPTION] })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /review-per-details/change-name', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .get('/prisoners/12345-67890/review-per-details/change-name')
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should render page', () => {
    flashProvider.mockReturnValue([])
    signedCookiesProvider.mockReturnValue({ 'new-arrival': newArrival })

    return request(app)
      .get('/prisoners/12345-67890/review-per-details/change-name')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain("Change this person's name")
      })
  })

  it('redirects when no cookie present', () => {
    signedCookiesProvider.mockReturnValue({})

    return request(app).get('/prisoners/12345-67890/review-per-details/change-name').expect(302).expect('Location', '/')
  })
})

describe('POST /review-per-details/change-name', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .post('/prisoners/12345-67890/review-per-details/change-name')
      .send({})
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should redirect when no cookie present', () => {
    signedCookiesProvider.mockReturnValue({})

    return request(app)
      .post('/prisoners/12345-67890/review-per-details/change-name')
      .expect(302)
      .expect('Location', '/')
  })

  it('should update name in cookie', () => {
    signedCookiesProvider.mockReturnValue({ 'new-arrival': newArrival })

    return request(app)
      .post('/prisoners/12345-67890/review-per-details/change-name')
      .send({ firstName: 'Bob', lastName: 'Smith' })
      .expect(res => {
        expectSettingCookie(res, 'new-arrival').toStrictEqual({
          firstName: 'Bob',
          lastName: 'Smith',
          dateOfBirth: '1973-01-08',
          sex: 'MALE',
          prisonNumber: 'A1234AB',
          pncNumber: '99/98644M',
        })
      })
  })

  it('should redirect after successful update', () => {
    signedCookiesProvider.mockReturnValue({ 'new-arrival': newArrival })

    return request(app)
      .post('/prisoners/12345-67890/review-per-details/change-name')
      .send({ firstName: 'William', lastName: 'Shakespeare' })
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/review-per-details')
  })

  it('should redirect when validation error', () => {
    signedCookiesProvider.mockReturnValue({ 'new-arrival': newArrival })

    return request(app)
      .post('/prisoners/12345-67890/review-per-details/change-name')
      .send({ lastName: 'Shakespeare' })
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/review-per-details/change-name')
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('errors', [
          { href: '#first-name', text: "Enter this person's first name" },
        ])
        expect(flashProvider).toHaveBeenCalledWith('input', { lastName: 'Shakespeare' })
      })
  })
})
