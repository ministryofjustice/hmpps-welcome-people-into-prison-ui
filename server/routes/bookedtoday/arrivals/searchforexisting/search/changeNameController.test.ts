import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider, stubCookie } from '../../../../__testutils/appSetup'
import Role from '../../../../../authentication/role'
import config from '../../../../../config'
import { expectSettingCookie } from '../../../../__testutils/requestTestUtils'
import { State } from '../../state'
import { createLockManager } from '../../../../../data/__testutils/mocks'

let app: Express
const lockManager = createLockManager()

const searchDetails = {
  firstName: 'James',
  lastName: 'Smyth',
  dateOfBirth: '1973-01-08',
  pncNumber: '99/98644M',
  prisonNumber: 'A1234AB',
}

beforeEach(() => {
  lockManager.isLocked.mockResolvedValue(false)
  config.confirmNoIdentifiersEnabled = true
  app = appWithAllRoutes({ services: { lockManager }, roles: [Role.PRISON_RECEPTION] })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /search-for-existing-record/change-name', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/change-name')
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should redirect to /duplicate-booking-prevention if arrival already confirmed', () => {
    lockManager.isLocked.mockResolvedValue(true)
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/change-name')
      .expect(302)
      .expect('Location', '/duplicate-booking-prevention')
  })
  it('should render page', () => {
    flashProvider.mockReturnValue([])
    stubCookie(State.searchDetails, searchDetails)

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/change-name')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('legend').text()).toContain("Change this person's name")
      })
  })

  it('redirects when no cookie present', () => {
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/change-name')
      .expect(302)
      .expect('Location', '/page-not-found')
  })
})

describe('POST /search-for-existing-record/change-name', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/change-name')
      .send({})
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should redirect when no cookie present', () => {
    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/change-name')
      .expect(302)
      .expect('Location', '/page-not-found')
  })

  it('should update name in cookie', () => {
    stubCookie(State.searchDetails, searchDetails)

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/change-name')
      .send({ firstName: 'Bob', lastName: 'Smith' })
      .expect(res => {
        expectSettingCookie(res, State.searchDetails).toStrictEqual({
          firstName: 'Bob',
          lastName: 'Smith',
          dateOfBirth: '1973-01-08',
          prisonNumber: 'A1234AB',
          pncNumber: '99/98644M',
        })
      })
  })

  it('should redirect after successful update', () => {
    stubCookie(State.searchDetails, searchDetails)

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/change-name')
      .send({ firstName: 'William', lastName: 'Shakespeare' })
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/search-for-existing-record')
  })

  it('should redirect when validation error', () => {
    stubCookie(State.searchDetails, searchDetails)

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/change-name')
      .send({ lastName: 'Shakespeare' })
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/search-for-existing-record/change-name')
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('errors', [
          { href: '#first-name', text: "Enter this person's first name" },
        ])
        expect(flashProvider).toHaveBeenCalledWith('input', { lastName: 'Shakespeare' })
      })
  })
})
