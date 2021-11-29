import nock from 'nock'
import moment from 'moment'
import { Gender, ImprisonmentStatus, Movement, Transfer, NewOffenderBooking, Prison, UserCaseLoad } from 'welcome'
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

  describe('getUserCaseLoads', () => {
    const userCaseLoads: UserCaseLoad[] = []
    it('should return data from api', async () => {
      fakeWelcomeApi
        .get('/prison/users/me/caseLoads')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, userCaseLoads)

      const output = await welcomeClient.getUserCaseLoads()
      expect(output).toEqual(userCaseLoads)
    })
  })

  describe('getExpectedArrivals', () => {
    const activeCaseLoadId = 'MDI'
    const date = moment()
    const expectedArrivals: Movement[] = []
    it('should return data from api', async () => {
      fakeWelcomeApi
        .get(`/prisons/${activeCaseLoadId}/arrivals?date=${date.format('YYYY-MM-DD')}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, expectedArrivals)

      const output = await welcomeClient.getExpectedArrivals(activeCaseLoadId, date)
      expect(output).toEqual(expectedArrivals)
    })
  })

  describe('getTransfers', () => {
    const activeCaseLoadId = 'MDI'
    const expectedArrivals: Movement[] = []
    it('should return data from api', async () => {
      fakeWelcomeApi
        .get(`/prisons/${activeCaseLoadId}/transfers/enroute`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, expectedArrivals)

      const output = await welcomeClient.getTransfers(activeCaseLoadId)
      expect(output).toEqual(expectedArrivals)
    })
  })

  describe('get Transfer', () => {
    const activeCaseLoadId = 'MDI'
    const prisonNumber = 'A1234AB'
    const expectedArrival: Transfer = {
      firstName: 'Sam',
      lastName: 'Smith',
      dateOfBirth: '1971-02-01',
      prisonNumber: 'A1234AA',
      pncNumber: '01/1234X',
      date: '2020-02-23',
      fromLocation: 'Kingston-upon-Hull Crown Court',
    }
    it('should return single a transfer from api', async () => {
      fakeWelcomeApi
        .get(`/prisons/${activeCaseLoadId}/transfers/enroute/${prisonNumber}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, expectedArrival)

      const output = await welcomeClient.getTransfer(activeCaseLoadId, prisonNumber)
      expect(output).toEqual(expectedArrival)
    })
  })

  describe('confirmTransfer', () => {
    const prisonNumber = 'A1234AB'
    it('should call rest client successfully', async () => {
      fakeWelcomeApi
        .post(`/transfers/${prisonNumber}/confirm`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, {})

      return expect(welcomeClient.confirmTransfer(prisonNumber)).resolves.toStrictEqual({})
    })
  })

  describe('getArrival', () => {
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

      const output = await welcomeClient.getArrival(id)
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
  describe('getImprisonmentStatuses', () => {
    const mockResponse: ImprisonmentStatus[] = [
      {
        code: 'on-remand',
        description: 'On remand',
        imprisonmentStatusCode: 'RX',
        movementReasons: [{ movementReasonCode: 'R' }],
      },
      {
        code: 'convicted-unsentenced',
        description: 'Convicted unsentenced',
        imprisonmentStatusCode: 'JR',
        movementReasons: [{ movementReasonCode: 'V' }],
      },
      {
        code: 'determinate-sentence',
        description: 'Determinate sentence',
        imprisonmentStatusCode: 'SENT',
        secondLevelTitle: 'What is the type of determinate sentence?',
        secondLevelValidationMessage: 'Select the type of determinate sentence',
        movementReasons: [
          { description: 'Extended sentence for public protection', movementReasonCode: '26' },
          { description: 'Imprisonment without option of a fine', movementReasonCode: 'I' },
          { description: 'Intermittent custodial sentence', movementReasonCode: 'INTER' },
          { description: 'Partly suspended sentence', movementReasonCode: 'P' },
        ],
      },
    ]

    it('should get data in correct format', async () => {
      fakeWelcomeApi
        .get('/imprisonment-statuses')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, mockResponse)

      const output = await welcomeClient.getImprisonmentStatuses()
      expect(output).toEqual(mockResponse)
    })
  })
})
