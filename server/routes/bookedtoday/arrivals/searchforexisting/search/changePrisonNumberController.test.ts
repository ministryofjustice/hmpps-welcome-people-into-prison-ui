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
  config.confirmNoIdentifiersEnabled = true
  lockManager.getLockStatus.mockResolvedValue(false)
  app = appWithAllRoutes({ services: { lockManager }, roles: [Role.PRISON_RECEPTION] })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /search-for-existing-record/change-prison-number', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/change-prison-number')
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should redirect to /duplicate-booking-prevention if arrival already confirmed', () => {
    lockManager.getLockStatus.mockResolvedValue(true)

    app = appWithAllRoutes({
      services: { lockManager },
      roles: [Role.PRISON_RECEPTION],
    })

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/change-prison-number')
      .expect(302)
      .expect('Location', '/duplicate-booking-prevention')
  })
  it('should render page', () => {
    flashProvider.mockReturnValue([])
    stubCookie(State.searchDetails, searchDetails)

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/change-prison-number')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain("Add or change this person's prison number")
      })
  })

  it('redirects when no cookie present', () => {
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/change-prison-number')
      .expect(302)
      .expect('Location', '/page-not-found')
  })
})

describe('POST /search-for-existing-record/change-prison-number', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/change-prison-number')
      .send({})
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should redirect when no cookie present', () => {
    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/change-prison-number')
      .expect(302)
      .expect('Location', '/page-not-found')
  })

  it('should update prison number in cookie', () => {
    stubCookie(State.searchDetails, searchDetails)

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/change-prison-number')
      .send({ prisonNumber: 'A1234CC' })
      .expect(res => {
        expectSettingCookie(res, State.searchDetails).toStrictEqual({
          firstName: 'James',
          lastName: 'Smyth',
          dateOfBirth: '1973-01-08',
          prisonNumber: 'A1234CC',
          pncNumber: '99/98644M',
        })
      })
  })

  it('should redirect after successful update', () => {
    stubCookie(State.searchDetails, searchDetails)

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/change-prison-number')
      .send({ day: '01', month: '02', year: '2003' })
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/search-for-existing-record')
  })

  it('should redirect when validation error', () => {
    stubCookie(State.searchDetails, searchDetails)

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/change-prison-number')
      .send({ prisonNumber: 'AAAAAA' })
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/search-for-existing-record/change-prison-number')
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('errors', [
          { href: '#prison-number', text: 'Enter a prison number in the correct format' },
        ])
        expect(flashProvider).toHaveBeenCalledWith('input', { prisonNumber: 'AAAAAA' })
      })
  })
})

describe('GET /search-for-existing-record/remove-prison-number', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/remove-prison-number')
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should redirect when no cookie present', () => {
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/remove-prison-number')
      .expect(302)
      .expect('Location', '/page-not-found')
  })

  it('should update prison number in cookie', () => {
    stubCookie(State.searchDetails, searchDetails)

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/remove-prison-number')
      .expect(res => {
        expectSettingCookie(res, State.searchDetails).toStrictEqual({
          firstName: 'James',
          lastName: 'Smyth',
          dateOfBirth: '1973-01-08',
          pncNumber: '99/98644M',
        })
      })
  })

  it('should redirect after successful update', () => {
    stubCookie(State.searchDetails, searchDetails)

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/remove-prison-number')
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/search-for-existing-record')
  })
})
