import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, signedCookiesProvider } from '../../../__testutils/appSetup'
import Role from '../../../../authentication/role'

let app: Express

const searchDetails = {
  firstName: 'James',
  lastName: 'Smyth',
  dateOfBirth: '1973-01-08',
  pncNumber: '99/98644M',
  prisonNumber: 'A1234AB',
}

beforeEach(() => {
  app = appWithAllRoutes({ roles: [Role.PRISON_RECEPTION] })
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

  it('should render page', () => {
    signedCookiesProvider.mockReturnValue({ 'search-details': searchDetails })

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/change-name')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain("Change this person's name")
      })
  })

  it('redirects when no cookie present', () => {
    signedCookiesProvider.mockReturnValue({})

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/change-name')
      .expect(302)
      .expect('Location', '/')
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
    signedCookiesProvider.mockReturnValue({})

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/change-name')
      .expect(302)
      .expect('Location', '/')
  })

  it('should update name in cookie', () => {
    signedCookiesProvider.mockReturnValue({ 'search-details': searchDetails })

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/change-name')
      .send({ firstName: 'Bob', lastName: 'Smith' })
      .expect(res => {
        expect(res.header['set-cookie'][0]).toContain(
          encodeURIComponent(
            JSON.stringify({
              firstName: 'Bob',
              lastName: 'Smith',
              dateOfBirth: '1973-01-08',
              prisonNumber: 'A1234AB',
              pncNumber: '99/98644M',
            })
          )
        )
      })
  })

  it('should redirect after successful update', () => {
    signedCookiesProvider.mockReturnValue({ 'search-details': searchDetails })

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/change-name')
      .send({ day: '01', month: '02', year: '2003' })
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/search-for-existing-record')
  })
})