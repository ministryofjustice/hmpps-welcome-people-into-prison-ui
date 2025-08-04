import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from './__testutils/appSetup'
import config from '../config'
import Role from '../authentication/role'

let app: Express
describe('GET /', () => {
  it('should render recent arrivals card text for MALE prison', () => {
    config.showRecentArrivals = true
    config.femalePrisons = ['ABC', 'XYZ']

    app = appWithAllRoutes({
      roles: [Role.PRISON_RECEPTION],
      userSupplier: () => ({
        token: 'token',
        username: 'user1',
        activeCaseLoadId: 'MDI',
        authSource: 'NOMIS',
      }),
    })

    return request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($("[data-qa='recent-arrivals']").text()).toContain(
          'Record a body scan and add a case note for prisoners who have arrived within the last 3 days.',
        )
      })
  })

  it('should render recent arrivals card text for FEMALE prison', () => {
    config.showRecentArrivals = true
    config.femalePrisons = ['ABC', 'XYZ']

    app = appWithAllRoutes({
      roles: [Role.PRISON_RECEPTION],
      userSupplier: () => ({
        token: 'token',
        username: 'user1',
        activeCaseLoadId: 'ABC',
        authSource: 'NOMIS',
      }),
    })

    return request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($("[data-qa='recent-arrivals']").text()).toContain(
          'Manage reception tasks for prisoners who have arrived within the last 3 days.',
        )
      })
  })
})
