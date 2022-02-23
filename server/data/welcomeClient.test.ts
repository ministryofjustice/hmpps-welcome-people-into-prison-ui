import nock from 'nock'
import moment from 'moment'
import {
  Gender,
  ImprisonmentStatus,
  Arrival,
  Transfer,
  NewOffenderBooking,
  Prison,
  UserCaseLoad,
  TemporaryAbsence,
} from 'welcome'
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
    nock.abortPendingRequests()
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
    const expectedArrivals: Arrival[] = []
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
    const expectedArrivals: Arrival[] = []
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

  describe('getTemporaryAbsences', () => {
    const activeCaseLoadId = 'MDI'
    const temporaryAbsences: TemporaryAbsence[] = []
    it('should return data from api', async () => {
      fakeWelcomeApi
        .get(`/temporary-absences/${activeCaseLoadId}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, temporaryAbsences)

      const output = await welcomeClient.getTemporaryAbsences(activeCaseLoadId)
      expect(output).toEqual(temporaryAbsences)
    })
  })

  describe('getTemporaryAbsence', () => {
    const activeCaseLoadId = 'MDI'
    const prisonNumber = 'A1234AB'
    const temporaryAbsence: TemporaryAbsence = {
      firstName: 'Sam',
      lastName: 'Smith',
      dateOfBirth: '1971-02-01',
      prisonNumber: 'A1234AA',
      reasonForAbsence: 'Hospital appointment',
      movementDateTime: '2022-01-17T14:20:00',
    }
    it('should return single a transfer from api', async () => {
      fakeWelcomeApi
        .get(`/temporary-absences/${activeCaseLoadId}/${prisonNumber}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, temporaryAbsence)

      const output = await welcomeClient.getTemporaryAbsence(activeCaseLoadId, prisonNumber)
      expect(output).toEqual(temporaryAbsence)
    })
  })

  describe('confirmTemporaryAbsence', () => {
    const prisonNumber = 'A1234AB'

    it('should call rest client successfully', async () => {
      fakeWelcomeApi
        .post(`/temporary-absences/${prisonNumber}/confirm`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, { prisonNumber: 'A1234AB', location: 'Reception' })

      return expect(welcomeClient.confirmTemporaryAbsence(prisonNumber, 'MDI')).resolves.toStrictEqual({
        prisonNumber: 'A1234AB',
        location: 'Reception',
      })
    })
  })

  describe('confirmTransfer', () => {
    const prisonNumber = 'A1234AB'
    it('should call rest client successfully', async () => {
      fakeWelcomeApi
        .post(`/transfers/${prisonNumber}/confirm`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, { prisonNumber: 'A1234AB', location: 'Reception' })

      return expect(welcomeClient.confirmTransfer(prisonNumber)).resolves.toStrictEqual({
        prisonNumber: 'A1234AB',
        location: 'Reception',
      })
    })
  })

  describe('getArrival', () => {
    const expectedArrival = {
      id,
      firstName: 'Jim',
      lastName: 'Smith',
      dateOfBirth: '1973-01-08',
      prisonNumber: 'A1234AB',
      pncNumber: '01/98644M',
      date: '2021-10-13',
      fromLocation: 'Some court',
      fromLocationType: 'COURT',
    } as Arrival

    it('should return data from api', async () => {
      fakeWelcomeApi.get(`/arrivals/${id}`).matchHeader('authorization', `Bearer ${token}`).reply(200, expectedArrival)

      const output = await welcomeClient.getArrival(id)
      expect(output).toEqual(expectedArrival)
    })
  })

  describe('confirmCourtReturn', () => {
    it('should call rest client successfully', async () => {
      fakeWelcomeApi
        .post(`/court-returns/${id}/confirm`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, { prisonNumber: 'A1234AB', location: 'Reception' })

      return expect(welcomeClient.confirmCourtReturn(id, 'MDI')).resolves.toStrictEqual({
        prisonNumber: 'A1234AB',
        location: 'Reception',
      })
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
        .reply(200, { prisonNumber: 'A1234AB', location: 'Reception' })

      const output = await welcomeClient.createOffenderRecordAndBooking(id, newOffender)
      expect(output).toEqual({ prisonNumber: 'A1234AB', location: 'Reception' })
    })

    it('should return null', async () => {
      fakeWelcomeApi
        .post(`/arrivals/${id}/confirm`, newOffender)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(400)

      const output = await welcomeClient.createOffenderRecordAndBooking(id, newOffender)
      return expect(output).toBe(null)
    })

    it('server error thrown', async () => {
      fakeWelcomeApi
        .post(`/arrivals/${id}/confirm`, newOffender)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(500)

      await expect(welcomeClient.createOffenderRecordAndBooking(id, newOffender)).rejects.toThrow(
        'Internal Server Error'
      )
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
  describe('matching records', () => {
    const arrival = {
      firstName: 'James',
      lastName: 'Charles',
      dateOfBirth: '1988-07-13',
    }
    const matchedRecords = [
      {
        firstName: 'James',
        lastName: 'Charles',
        dateOfBirth: '1988-07-13',
        prisonNumber: 'A5534HA',
        pncNumber: '11/836373L',
        croNumber: '952184/22A',
      },
      {
        firstName: 'James Paul',
        lastName: 'Charles',
        dateOfBirth: '1988-07-13',
        prisonNumber: 'A3684DA',
        pncNumber: '07/652634A',
        croNumber: '342256/21A',
      },
    ]
    it('should get matching records', async () => {
      fakeWelcomeApi
        .post(`/match-prisoners`, arrival)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, matchedRecords)

      const output = await welcomeClient.getMatchingRecords(arrival)
      expect(output[0]).toEqual(matchedRecords[0])
      expect(output[1]).toEqual(matchedRecords[1])
    })

    it('should get prisoner details', async () => {
      const prisonNumber = 'A3684DA'
      fakeWelcomeApi
        .get(`/prisoners/${prisonNumber}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, matchedRecords[1])

      const output = await welcomeClient.getPrisonerDetails(prisonNumber)
      expect(output).toEqual(matchedRecords[1])
    })
  })
})
