import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../../__testutils/appSetup'

import Role from '../../../../authentication/role'
import config from '../../../../config'
import { expectSettingCookie } from '../../../__testutils/requestTestUtils'
import { State } from '../state'
import { createArrival, createPotentialMatch } from '../../../../data/__testutils/testObjects'
import { createMockExpectedArrivalsService } from '../../../../services/__testutils/mocks'

const arrival = createArrival({
  prisonNumber: 'A1234AA',
  potentialMatches: [
    createPotentialMatch({ prisonNumber: 'A1234BB' }),
    createPotentialMatch({ prisonNumber: 'A1234CC' }),
  ],
})

let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()

beforeEach(() => {
  config.confirmNoIdentifiersEnabled = true
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getArrival.mockResolvedValue(arrival)
  expectedArrivalsService.getPrisonerDetails.mockResolvedValue(arrival.potentialMatches[0])
  flashProvider.mockReturnValue([])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('possible records found', () => {
  describe('view', () => {
    it('should call service method correctly', () => {
      return request(app)
        .get(`/prisoners/${arrival.id}/possible-records-found`)
        .expect(() => {
          expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith(arrival.id)
        })
    })

    it('should render page correctly', () => {
      return request(app)
        .get(`/prisoners/${arrival.id}/possible-records-found`)
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Possible existing records have been found')
        })
    })
  })

  describe('submit', () => {
    it('should redirect if errors', () => {
      return request(app)
        .post('/prisoners/12345-67890/possible-records-found')
        .send()
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/possible-records-found')
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('errors', [
            {
              text: 'Select an existing record or search using different details',
              href: '#record-1',
            },
          ])
        })
    })

    it('should redirect to /sex page if no errors', () => {
      return request(app)
        .post('/prisoners/12345-67890/possible-records-found')
        .send({ prisonNumber: arrival.potentialMatches[0] })
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/sex')
        .expect(req => {
          expect(flashProvider).not.toHaveBeenCalled()
          expect(expectedArrivalsService.getPrisonerDetails).toHaveBeenCalledWith(arrival.potentialMatches[0])
          const { croNumber, ...fields } = arrival.potentialMatches[0]
          expectSettingCookie(req, State.newArrival).toStrictEqual({ expected: 'true', ...fields })
        })
    })
  })
})
