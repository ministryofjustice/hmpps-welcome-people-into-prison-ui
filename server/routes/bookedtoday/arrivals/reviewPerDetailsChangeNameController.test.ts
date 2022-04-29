import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider, stubCookie } from '../../__testutils/appSetup'
import Role from '../../../authentication/role'
import config from '../../../config'
import { expectSettingCookie } from '../../__testutils/requestTestUtils'
import { NewArrival, State } from './state'

let app: Express

const newArrival: NewArrival = {
  firstName: 'James',
  lastName: 'Smyth',
  dateOfBirth: '1973-01-08',
  sex: 'MALE',
  pncNumber: '99/98644M',
  prisonNumber: 'A1234AB',
  expected: true,
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
    stubCookie(State.newArrival, newArrival)

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
    return request(app)
      .get('/prisoners/12345-67890/review-per-details/change-name')
      .expect(302)
      .expect('Location', '/page-not-found')
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
    return request(app)
      .post('/prisoners/12345-67890/review-per-details/change-name')
      .expect(302)
      .expect('Location', '/page-not-found')
  })

  it('should update name in cookie', () => {
    stubCookie(State.newArrival, newArrival)

    return request(app)
      .post('/prisoners/12345-67890/review-per-details/change-name')
      .send({ firstName: 'Bob', lastName: 'Smith' })
      .expect(res => {
        expectSettingCookie(res, State.newArrival).toStrictEqual({
          firstName: 'Bob',
          lastName: 'Smith',
          dateOfBirth: '1973-01-08',
          sex: 'MALE',
          prisonNumber: 'A1234AB',
          pncNumber: '99/98644M',
          expected: 'true',
        })
      })
  })

  it('should redirect after successful update', () => {
    stubCookie(State.newArrival, newArrival)
    return request(app)
      .post('/prisoners/12345-67890/review-per-details/change-name')
      .send({ firstName: 'William', lastName: 'Shakespeare' })
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/review-per-details')
  })

  it('should redirect when validation error', () => {
    stubCookie(State.newArrival, newArrival)

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
