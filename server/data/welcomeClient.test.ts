import nock from 'nock'
import moment from 'moment'
import type { Arrival, ConfirmArrivalDetail, Prison, TemporaryAbsence, UserCaseLoad } from 'welcome'
import WelcomeClient from './welcomeClient'
import config from '../config'
import {
  createArrival,
  createArrivalResponse,
  createImprisonmentStatuses,
  createMatchCriteria,
  createPotentialMatch,
  createRecentArrival,
  createRecentArrivalResponse,
  createTemporaryAbsence,
  createTransfer,
} from './__testutils/testObjects'

describe('welcomeClient', () => {
  let fakeWelcomeApi: nock.Scope
  let welcomeClient: WelcomeClient

  const arrivalResponse = createArrivalResponse()
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
    const arrivals: Arrival[] = []
    it('should return data from api', async () => {
      fakeWelcomeApi
        .get(`/prisons/${activeCaseLoadId}/arrivals?date=${date.format('YYYY-MM-DD')}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, arrivals)

      const output = await welcomeClient.getExpectedArrivals(activeCaseLoadId, date)
      expect(output).toEqual(arrivals)
    })
  })

  describe('getRecentArrivals', () => {
    const activeCaseLoadId = 'MDI'
    const fromDate = moment().subtract(2, 'days').format('YYYY-MM-DD')
    const middleDate = moment().subtract(1, 'days').format('YYYY-MM-DD')
    const toDate = moment().format('YYYY-MM-DD')
    const searchQuery = 'John Doe'
    const recentArrivals = createRecentArrivalResponse({
      content: [
        createRecentArrival({ movementDateTime: `${toDate}T13:16:00` }),
        createRecentArrival({ movementDateTime: `${middleDate}T14:40:01` }),
        createRecentArrival({ movementDateTime: `${fromDate}T18:20:00` }),
        createRecentArrival({ movementDateTime: `${middleDate}T14:40:00` }),
        createRecentArrival({ movementDateTime: `${toDate}T09:12:00` }),
        createRecentArrival({ movementDateTime: `${middleDate}T14:55:00` }),
        createRecentArrival({ movementDateTime: `${toDate}T13:15:00` }),
        createRecentArrival({ firstName: 'John', lastName: 'Doe', movementDateTime: `${toDate}T13:15:00` }),
      ],
    })
    it('should return data from api', async () => {
      fakeWelcomeApi
        .get(`/prisons/${activeCaseLoadId}/recent-arrivals?fromDate=${fromDate}&toDate=${toDate}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, recentArrivals)

      const fromDateMoment = moment().subtract(2, 'days')
      const toDateMoment = moment()
      const output = await welcomeClient.getRecentArrivals(activeCaseLoadId, fromDateMoment, toDateMoment)
      expect(output).toEqual(recentArrivals)
    })

    it('should return search results if search query present', async () => {
      fakeWelcomeApi
        .get(`/prisons/${activeCaseLoadId}/recent-arrivals?fromDate=${fromDate}&toDate=${toDate}&query=${searchQuery}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(
          200,
          createRecentArrivalResponse({
            content: [
              createRecentArrival({ firstName: 'John', lastName: 'Doe', movementDateTime: `${toDate}T13:15:00` }),
            ],
          })
        )

      const fromDateMoment = moment().subtract(2, 'days')
      const toDateMoment = moment()
      const output = await welcomeClient.getRecentArrivals(activeCaseLoadId, fromDateMoment, toDateMoment, searchQuery)
      expect(output).toEqual(
        createRecentArrivalResponse({
          content: [
            createRecentArrival({ firstName: 'John', lastName: 'Doe', movementDateTime: `${toDate}T13:15:00` }),
          ],
        })
      )
    })
  })

  describe('getTransfers', () => {
    const activeCaseLoadId = 'MDI'
    const transfers: Arrival[] = []
    it('should return data from api', async () => {
      fakeWelcomeApi
        .get(`/prisons/${activeCaseLoadId}/transfers`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, transfers)

      const output = await welcomeClient.getTransfers(activeCaseLoadId)
      expect(output).toEqual(transfers)
    })
  })

  describe('get Transfer', () => {
    const activeCaseLoadId = 'MDI'
    const prisonNumber = 'A1234AB'
    const transfer = createTransfer()
    it('should return single a transfer from api', async () => {
      fakeWelcomeApi
        .get(`/prisons/${activeCaseLoadId}/transfers/${prisonNumber}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, transfer)

      const output = await welcomeClient.getTransfer(activeCaseLoadId, prisonNumber)
      expect(output).toEqual(transfer)
    })
  })

  describe('getTemporaryAbsences', () => {
    const activeCaseLoadId = 'MDI'
    const temporaryAbsences: TemporaryAbsence[] = []
    it('should return data from api', async () => {
      fakeWelcomeApi
        .get(`/prison/${activeCaseLoadId}/temporary-absences`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, temporaryAbsences)

      const output = await welcomeClient.getTemporaryAbsences(activeCaseLoadId)
      expect(output).toEqual(temporaryAbsences)
    })
  })

  describe('getTemporaryAbsence', () => {
    const prisonNumber = 'A1234AB'
    const temporaryAbsence = createTemporaryAbsence()
    it('should return single a transfer from api', async () => {
      fakeWelcomeApi
        .get(`/temporary-absences/${prisonNumber}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, temporaryAbsence)

      const output = await welcomeClient.getTemporaryAbsence(prisonNumber)
      expect(output).toEqual(temporaryAbsence)
    })
  })

  describe('confirmTemporaryAbsence', () => {
    const prisonNumber = 'A1234AB'

    it('should call rest client successfully', async () => {
      fakeWelcomeApi
        .post(`/temporary-absences/${prisonNumber}/confirm`, { prisonId: 'MDI', arrivalId: 'abc-123' })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, arrivalResponse)

      return expect(welcomeClient.confirmTemporaryAbsence(prisonNumber, 'MDI', 'abc-123')).resolves.toStrictEqual(
        arrivalResponse
      )
    })

    it('should return null', async () => {
      fakeWelcomeApi
        .post(`/temporary-absences/${prisonNumber}/confirm`, { prisonId: 'MDI' })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(404)

      const output = await welcomeClient.confirmTemporaryAbsence(prisonNumber, 'MDI')
      return expect(output).toBe(null)
    })

    it('should throw server error', async () => {
      fakeWelcomeApi
        .post(`/temporary-absences/${prisonNumber}/confirm`, { prisonId: 'MDI' })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(500)

      await expect(welcomeClient.confirmTemporaryAbsence(prisonNumber, 'MDI')).rejects.toThrow('Internal Server Error')
    })
  })

  describe('confirmTransfer', () => {
    const prisonNumber = 'A1234AB'
    it('should call rest client successfully', async () => {
      fakeWelcomeApi
        .post(`/transfers/${prisonNumber}/confirm`, { prisonId: 'MDI', arrivalId: 'abc-123' })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, arrivalResponse)

      return expect(welcomeClient.confirmTransfer(prisonNumber, 'MDI', 'abc-123')).resolves.toStrictEqual(
        arrivalResponse
      )
    })

    it('should return null', async () => {
      fakeWelcomeApi
        .post(`/transfers/${prisonNumber}/confirm`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(404)

      const output = await welcomeClient.confirmTransfer(prisonNumber, 'MDI')
      return expect(output).toBe(null)
    })

    it('should throw server error', async () => {
      fakeWelcomeApi
        .post(`/transfers/${prisonNumber}/confirm`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(500)

      await expect(welcomeClient.confirmTransfer(prisonNumber, 'MDI')).rejects.toThrow('Internal Server Error')
    })
  })

  describe('getArrival', () => {
    const arrival = createArrival()
    it('should return data from api', async () => {
      fakeWelcomeApi.get(`/arrivals/${id}`).matchHeader('authorization', `Bearer ${token}`).reply(200, arrival)

      const output = await welcomeClient.getArrival(id)
      expect(output).toEqual(arrival)
    })
  })

  describe('confirmCourtReturn', () => {
    it('should call rest client successfully', async () => {
      fakeWelcomeApi
        .post(`/court-returns/${id}/confirm`, { prisonId: 'MDI', prisonNumber: 'A1234AA' })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, arrivalResponse)

      return expect(welcomeClient.confirmCourtReturn(id, 'MDI', 'A1234AA')).resolves.toStrictEqual(arrivalResponse)
    })
    it('should return null', async () => {
      fakeWelcomeApi
        .post(`/court-returns/${id}/confirm`, { prisonId: 'MDI', prisonNumber: 'A1234AA' })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(404)

      const output = await welcomeClient.confirmCourtReturn(id, 'MDI', 'A1234AA')
      return expect(output).toBe(null)
    })

    it('should throw server error', async () => {
      fakeWelcomeApi
        .post(`/court-returns/${id}/confirm`, { prisonId: 'MDI', prisonNumber: 'A1234AA' })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(500)

      await expect(welcomeClient.confirmCourtReturn(id, 'MDI', 'A1234AA')).rejects.toThrow('Internal Server Error')
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

  describe('confirmExpectedArrival', () => {
    const detail: ConfirmArrivalDetail = {
      firstName: 'Jim',
      lastName: 'Smith',
      dateOfBirth: '1973-01-08',
      sex: 'NS',
      prisonId: 'MDI',
      imprisonmentStatus: 'RX',
      movementReasonCode: 'N',
      prisonNumber: 'A1234AA',
    }

    it('should send data to api and return a prisoner number', async () => {
      fakeWelcomeApi
        .post(`/arrivals/${id}/confirm`, detail)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, arrivalResponse)

      const output = await welcomeClient.confirmExpectedArrival(id, detail)
      expect(output).toEqual(arrivalResponse)
    })

    it('should return null', async () => {
      fakeWelcomeApi.post(`/arrivals/${id}/confirm`, detail).matchHeader('authorization', `Bearer ${token}`).reply(400)

      const output = await welcomeClient.confirmExpectedArrival(id, detail)
      return expect(output).toBe(null)
    })

    it('server error thrown', async () => {
      fakeWelcomeApi.post(`/arrivals/${id}/confirm`, detail).matchHeader('authorization', `Bearer ${token}`).reply(500)

      await expect(welcomeClient.confirmExpectedArrival(id, detail)).rejects.toThrow('Internal Server Error')
    })
  })

  describe('confirmUnexpectedArrival', () => {
    const detail: ConfirmArrivalDetail = {
      firstName: 'Jim',
      lastName: 'Smith',
      dateOfBirth: '1973-01-08',
      sex: 'NS',
      prisonId: 'MDI',
      imprisonmentStatus: 'RX',
      movementReasonCode: 'N',
      prisonNumber: 'A1234AA',
    }

    it('should send data to api and return a prisoner number', async () => {
      fakeWelcomeApi
        .post(`/unexpected-arrivals/confirm`, detail)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, arrivalResponse)

      const output = await welcomeClient.confirmUnexpectedArrival(detail)
      expect(output).toEqual(arrivalResponse)
    })

    it('should return null', async () => {
      fakeWelcomeApi
        .post(`/unexpected-arrivals/confirm`, detail)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(400)

      const output = await welcomeClient.confirmUnexpectedArrival(detail)
      return expect(output).toBe(null)
    })

    it('server error thrown', async () => {
      fakeWelcomeApi
        .post(`/unexpected-arrivals/confirm`, detail)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(500)

      await expect(welcomeClient.confirmUnexpectedArrival(detail)).rejects.toThrow('Internal Server Error')
    })
  })

  describe('getImprisonmentStatuses', () => {
    const imprisonmentStatus = createImprisonmentStatuses()

    it('should get data in correct format', async () => {
      fakeWelcomeApi
        .get('/imprisonment-statuses')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, imprisonmentStatus)

      const output = await welcomeClient.getImprisonmentStatuses()
      expect(output).toEqual(imprisonmentStatus)
    })
  })
  describe('matching records', () => {
    const criteria = createMatchCriteria()

    it('should get matching records', async () => {
      fakeWelcomeApi
        .post(`/match-prisoners`, criteria)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, [createPotentialMatch()])

      const output = await welcomeClient.getMatchingRecords(criteria)
      expect(output).toStrictEqual([createPotentialMatch()])
    })

    it('should get prisoner details', async () => {
      const potentialMatch = createPotentialMatch()
      const prisonNumber = 'A3684DA'
      fakeWelcomeApi
        .get(`/prisoners/${prisonNumber}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, potentialMatch)

      const output = await welcomeClient.getPrisonerDetails(prisonNumber)
      expect(output).toEqual(potentialMatch)
    })
  })
})
