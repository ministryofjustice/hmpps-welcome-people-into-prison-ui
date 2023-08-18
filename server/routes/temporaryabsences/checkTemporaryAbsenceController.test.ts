import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../__testutils/appSetup'
import { RaiseAnalyticsEvent } from '../../services'

import Role from '../../authentication/role'
import config from '../../config'
import { createTemporaryAbsence } from '../../data/__testutils/testObjects'
import { createMockTemporaryAbsencesService } from '../../services/__testutils/mocks'

let app: Express
const temporaryAbsencesService = createMockTemporaryAbsencesService()
const raiseAnalyticsEvent = jest.fn() as RaiseAnalyticsEvent

const createApp = ({ breadcrumb }: { breadcrumb: boolean } = { breadcrumb: true }, roles = [Role.PRISON_RECEPTION]) => {
  config.showBreadCrumb = breadcrumb
  return appWithAllRoutes({
    services: { temporaryAbsencesService, raiseAnalyticsEvent },
    roles,
  })
}

beforeEach(() => {
  config.confirmEnabled = true

  temporaryAbsencesService.getTemporaryAbsence.mockResolvedValue(createTemporaryAbsence())
  temporaryAbsencesService.confirmTemporaryAbsence.mockResolvedValue({
    prisonNumber: 'A1234AA',
    location: 'Reception',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET checkTemporaryAbsence', () => {
  it('should redirect to authentication error page for non reception users', () => {
    return request(createApp({ breadcrumb: true }, []))
      .get('/prisoners/A1234AA/check-temporary-absence')
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should only display back navigation of the back link type', () => {
    return request(createApp({ breadcrumb: false }))
      .get('/prisoners-returning')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($("[data-qa='back-link-navigation']").text()).toContain('Back')
        expect($("[data-qa='back-link-navigation']")).toHaveLength(1)
      })
  })

  it('should only display back navigation of the breadcrumb type', () => {
    return request(createApp())
      .get('/prisoners-returning')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('[data-qa=back-link-navigation] li').length).toEqual(2)
        expect($('[data-qa=back-link-navigation] li:nth-child(1) a').text()).toEqual('Digital Prison Services')
        expect($('[data-qa=back-link-navigation] li:nth-child(2) a').text()).toEqual('Welcome people into prison')
        expect($('[data-qa=back-link-navigation] li:nth-child(2) a').attr('href')).toEqual('/')
      })
  })

  it('should call service method correctly', () => {
    return request(createApp())
      .get('/prisoners/A1234AA/check-temporary-absence')
      .expect('Content-Type', /text\/html/)
      .expect(() => {
        expect(temporaryAbsencesService.getTemporaryAbsence).toHaveBeenCalledWith('A1234AA')
      })
  })

  it('should render the correct data in /check-temporary-absence page', () => {
    return request(createApp())
      .get('/prisoners/A1234AA/check-temporary-absence?arrivalId=abc-123')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('This person will be returned to prison')
        expect($('input[name = "arrivalId"]').attr('value')).toContain('abc-123')
        expect(res.text).toContain('/prisoners/A1234AA/check-temporary-absence')
      })
  })
})

describe('POST addToRoll', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).post('/prisoners/A1234AA/check-temporary-absence').expect(302).expect('Location', '/autherror')
  })

  it('should call service to confirm the temporary absence', () => {
    return request(createApp())
      .post('/prisoners/A1234AA/check-temporary-absence')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(() => {
        expect(temporaryAbsencesService.confirmTemporaryAbsence).toHaveBeenCalledWith(
          'user1',
          'A1234AA',
          'MDI',
          undefined
        )
      })
  })

  it('should call service to confirm the temporary absence with arrivalId when present', () => {
    return request(createApp())
      .post('/prisoners/A1234AA/check-temporary-absence')
      .send({ arrivalId: 'abc-123' })
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(() => {
        expect(temporaryAbsencesService.confirmTemporaryAbsence).toHaveBeenCalledWith(
          'user1',
          'A1234AA',
          'MDI',
          'abc-123'
        )
      })
  })

  it('should set flash with correct args', () => {
    return request(createApp())
      .post('/prisoners/A1234AA/check-temporary-absence')
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('prisoner', {
          firstName: 'Sam',
          lastName: 'Smith',
          location: 'Reception',
        })
      })
  })

  it('should call google analytics', () => {
    return request(createApp())
      .post('/prisoners/A1234AA/check-temporary-absence')
      .expect(() => {
        expect(raiseAnalyticsEvent).toHaveBeenCalledWith(
          'Add to the establishment roll',
          'Confirmed temporary absence returned',
          "AgencyId: MDI, Reason: Hospital appointment, Type: 'PRISON',"
        )
      })
  })

  it('should redirect to added to roll confirmation page', () => {
    return request(createApp())
      .post('/prisoners/A1234AA/check-temporary-absence')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(302)
      .expect('Location', '/prisoners/A1234AA/prisoner-returned')
  })

  it('should redirect to feature-not-available', () => {
    temporaryAbsencesService.confirmTemporaryAbsence.mockResolvedValue(null)
    return request(createApp())
      .post('/prisoners/A1234AA/check-temporary-absence')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(302)
      .expect('Location', '/feature-not-available')
  })
})
