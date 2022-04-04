import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../__testutils/appSetup'
import Role from '../../../authentication/role'
import { State } from '../arrivals/state'
import { expectSettingCookie } from '../../__testutils/requestTestUtils'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ roles: [Role.PRISON_RECEPTION] })
  flashProvider.mockReturnValue([])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('add personal records', () => {
  describe('view', () => {
    it('should call flash', () => {
      return request(app)
        .get('/manually-confirm-arrival/add-personal-details')
        .expect(() => {
          expect(flashProvider.mock.calls).toEqual([['errors'], ['input']])
        })
    })

    it('should render page correctly', () => {
      return request(app)
        .get('/manually-confirm-arrival/add-personal-details')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain("Add prisoner's personal details")
        })
    })
  })

  describe('submit', () => {
    it('should redirect if errors', () => {
      return request(app)
        .post('/manually-confirm-arrival/add-personal-details')
        .send({})
        .expect(302)
        .expect('Location', '/manually-confirm-arrival/add-personal-details')
        .expect(() => {
          expect(flashProvider.mock.calls).toEqual([
            [
              'errors',

              [
                {
                  href: '#first-name',
                  text: "Enter this person's first name",
                },
                {
                  href: '#last-name',
                  text: "Enter this person's last name",
                },
                {
                  href: '#date-of-birth-day',
                  text: "Enter this person's date of birth",
                },
                {
                  href: '#sex',
                  text: "Select this person's sex",
                },
              ],
            ],
            ['input', {}],
          ])
        })
    })

    it('should redirect to /sex page if no errors', () => {
      return request(app)
        .post('/manually-confirm-arrival/add-personal-details')
        .send({
          firstName: 'James',
          lastName: 'Smith',
          year: '2000',
          month: '10',
          day: '13',
          sex: 'M',
        })
        .expect(302)
        .expect('Location', '/prisoners/unexpected-arrival/sex')
        .expect(res => {
          expect(flashProvider).not.toHaveBeenCalled()
          expectSettingCookie(res, State.newArrival).toStrictEqual({
            dateOfBirth: '2000-10-13',
            expected: 'false',
            firstName: 'James',
            lastName: 'Smith',
            sex: 'M',
          })
        })
    })
  })
})
