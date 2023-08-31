import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from '../__testutils/appSetup'

let app: Express

describe('accessibilityStatementController', () => {
  beforeEach(() => {
    app = appWithAllRoutes({
      services: {},
      roles: [],
    })
  })

  describe('GET /accessibility-statement', () => {
    it('should render /accessibility-statement page', () => {
      return request(app)
        .get('/accessibility-statement')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Accessibility statement for Welcome people into prison')
        })
    })

    it('should display correct breadcrumbs', () => {
      return request(app)
        .get('/accessibility-statement')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.govuk-breadcrumbs__list li').length).toEqual(2)
          expect($('.govuk-breadcrumbs__list li:nth-child(1) a').text()).toEqual('Digital Prison Services')
          expect($('.govuk-breadcrumbs__list li:nth-child(2) a').text()).toEqual('Welcome people into prison')
          expect($('.govuk-breadcrumbs__list li:nth-child(2) a').attr('href')).toEqual('/')
        })
    })
  })
})
