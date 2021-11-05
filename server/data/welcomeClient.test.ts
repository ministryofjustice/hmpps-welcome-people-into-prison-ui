import nock from 'nock'
import moment from 'moment'
import { Gender, Movement, NewOffenderBooking, Prison } from 'welcome'
import WelcomeClient from './welcomeClient'
import config from '../config'

describe('welcomeClient', () => {
  let fakeWelcomeApi: nock.Scope
  let welcomeClient: WelcomeClient

  const token = 'token-1'
  const id = '12345-67890'

  beforeEach(() => {
    config.apis.welcome.url = 'http://localhost:8080'
    fakeWelcomeApi = nock(config.apis.welcome.url)
    welcomeClient = new WelcomeClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.cleanAll()
  })

  describe('getExpectedArrivals', () => {
    const activeCaseLoadId = 'MDI'
    const date = moment()
    const expectedArrivals: Movement[] = []
    it('should return data from api', async () => {
      fakeWelcomeApi
        .get(`/incoming-moves/${activeCaseLoadId}?date=${date.format('YYYY-MM-DD')}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, expectedArrivals)

      const output = await welcomeClient.getExpectedArrivals(activeCaseLoadId, date)
      expect(output).toEqual(expectedArrivals)
    })
  })

  describe('getMove', () => {
    const expectedArrival: Movement = {
      id,
      firstName: 'Jim',
      lastName: 'Smith',
      dateOfBirth: '1973-01-08',
      prisonNumber: 'A1234AB',
      pncNumber: '01/98644M',
      date: '2021-10-13',
      fromLocation: 'Some court',
      fromLocationType: 'COURT',
    }

    it('should return data from api', async () => {
      fakeWelcomeApi.get(`/arrivals/${id}`).matchHeader('authorization', `Bearer ${token}`).reply(200, expectedArrival)

      const output = await welcomeClient.getMove(id)
      expect(output).toEqual(expectedArrival)
    })
  })

  describe('getPrison', () => {
    const prison: Prison = {
      description: 'Moorland (HMP & YOI)',
    }
    const prisonId = 'MDI'

    it('should return data from api', async () => {
      fakeWelcomeApi.get(`/prison/${prisonId}`).matchHeader('authorization', `Bearer ${token}`).reply(200, prison)

      const output = await welcomeClient.getPrison(prisonId)
      expect(output).toEqual(prison)
    })
  })

  describe('createOffenderRecordAndBooking', () => {
    const newOffender: NewOffenderBooking = {
      firstName: 'Jim',
      lastName: 'Smith',
      dateOfBirth: '1973-01-08',
      gender: Gender.NOT_SPECIFIED,
      prisonId: 'MDI',
      imprisonmentStatus: 'RX',
      movementReasonCode: 'N',
    }

    it('should send data to api and return a prisoner number', async () => {
      fakeWelcomeApi
        .post(`/arrivals/${id}/confirm`, newOffender)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, { prisonNumber: 'A1234AB' })

      const output = await welcomeClient.createOffenderRecordAndBooking(id, newOffender)
      expect(output).toEqual({ prisonNumber: 'A1234AB' })
    })
  })
})
