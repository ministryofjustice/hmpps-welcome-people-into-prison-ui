import moment from 'moment'
import { type Arrival, LocationType } from 'welcome'
import ExpectedArrivalsService from './expectedArrivalsService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import WelcomeClient from '../data/welcomeClient'
import { NewArrival } from '../routes/bookedtoday/arrivals/state'
import { raiseAnalyticsEvent } from './raiseAnalyticsEvent'
import {
  createArrival,
  createRecentArrival,
  createArrivalResponse,
  createRecentArrivalResponse,
  createMatchCriteria,
  createNewArrival,
  createPotentialMatch,
  createTransfer,
} from '../data/__testutils/testObjects'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/welcomeClient')
jest.mock('./raiseAnalyticsEvent')

const token = 'some token'

describe('Expected arrivals service', () => {
  let welcomeClient: jest.Mocked<WelcomeClient>
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let service: ExpectedArrivalsService

  const WelcomeClientFactory = jest.fn()

  const arrivalResponse = createArrivalResponse()

  const res = { locals: { user: { activeCaseLoadId: 'MDI' } } }

  beforeEach(() => {
    jest.resetAllMocks()
    hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    welcomeClient = new WelcomeClient(null) as jest.Mocked<WelcomeClient>
    WelcomeClientFactory.mockReturnValue(welcomeClient)
    service = new ExpectedArrivalsService(hmppsAuthClient, WelcomeClientFactory, raiseAnalyticsEvent)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  describe('getExpectedArrivals', () => {
    const transferArrival: Arrival = {
      ...createTransfer(),
      isCurrentPrisoner: true,
      fromLocationType: LocationType.PRISON,
    }

    beforeEach(() => {
      const arrivals = [
        createArrival({ fromLocationType: LocationType.COURT }),
        createArrival({ fromLocationType: LocationType.CUSTODY_SUITE }),
        createArrival({ fromLocationType: LocationType.CUSTODY_SUITE }),
        createArrival({ fromLocationType: LocationType.CUSTODY_SUITE }),
        createArrival({ fromLocationType: LocationType.COURT }),
        createArrival({ fromLocationType: LocationType.OTHER }),
      ]

      welcomeClient.getTransfers.mockResolvedValue([transferArrival])
      welcomeClient.getExpectedArrivals.mockResolvedValue(arrivals)
    })

    it('Retrieves expected arrivals sorted alphabetically by name', async () => {
      const today = moment()
      const result = await service.getArrivalsForToday(res.locals.user.activeCaseLoadId, () => today)

      expect(result).toStrictEqual(
        new Map([
          [
            LocationType.COURT,
            [
              createArrival({ fromLocationType: LocationType.COURT }),
              createArrival({ fromLocationType: LocationType.COURT }),
            ],
          ],
          [LocationType.PRISON, [transferArrival]],
          [
            LocationType.CUSTODY_SUITE,
            [
              createArrival({ fromLocationType: LocationType.CUSTODY_SUITE }),
              createArrival({ fromLocationType: LocationType.CUSTODY_SUITE }),
              createArrival({ fromLocationType: LocationType.CUSTODY_SUITE }),
            ],
          ],
          [LocationType.OTHER, [createArrival({ fromLocationType: LocationType.OTHER })]],
        ])
      )

      expect(welcomeClient.getExpectedArrivals).toBeCalledWith(res.locals.user.activeCaseLoadId, today)
      expect(welcomeClient.getTransfers).toBeCalledWith(res.locals.user.activeCaseLoadId)
    })

    it('WelcomeClientFactory is called with a token', async () => {
      await service.getArrivalsForToday(res.locals.user.activeCaseLoadId)

      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(WelcomeClientFactory).toBeCalledWith(token)
    })
  })

  describe('getRecentArrivals', () => {
    const today = moment().startOf('day').format('YYYY-MM-DD')
    const oneDayAgo = moment().subtract(1, 'days').startOf('day').format('YYYY-MM-DD')
    const twoDaysAgo = moment().subtract(2, 'days').startOf('day').format('YYYY-MM-DD')

    beforeEach(() => {
      const recentArrivals = createRecentArrivalResponse({
        content: [
          createRecentArrival({ movementDateTime: `${today}T13:16:00` }),
          createRecentArrival({ movementDateTime: `${oneDayAgo}T14:40:01` }),
          createRecentArrival({ movementDateTime: `${twoDaysAgo}T18:20:00` }),
          createRecentArrival({ movementDateTime: `${oneDayAgo}T14:40:00` }),
          createRecentArrival({ movementDateTime: `${today}T09:12:00` }),
          createRecentArrival({ movementDateTime: `${oneDayAgo}T14:55:00` }),
          createRecentArrival({ movementDateTime: `${today}T13:15:00` }),
        ],
      })
      welcomeClient.getRecentArrivals.mockResolvedValue(recentArrivals)
    })

    it('Retrieves recent arrivals sorted by date and time', async () => {
      const dateTo = moment().startOf('day')
      const middleDate = moment().subtract(1, 'days').startOf('day')
      const dateFrom = moment().subtract(2, 'days').startOf('day')
      const result = await service.getRecentArrivalsGroupedByDate(res.locals.user.activeCaseLoadId)

      expect(result).toStrictEqual(
        new Map([
          [
            dateTo,
            [
              createRecentArrival({ movementDateTime: `${today}T09:12:00` }),
              createRecentArrival({ movementDateTime: `${today}T13:15:00` }),
              createRecentArrival({ movementDateTime: `${today}T13:16:00` }),
            ],
          ],
          [
            middleDate,
            [
              createRecentArrival({ movementDateTime: `${oneDayAgo}T14:40:00` }),
              createRecentArrival({ movementDateTime: `${oneDayAgo}T14:40:01` }),
              createRecentArrival({ movementDateTime: `${oneDayAgo}T14:55:00` }),
            ],
          ],
          [dateFrom, [createRecentArrival({ movementDateTime: `${twoDaysAgo}T18:20:00` })]],
        ])
      )

      expect(welcomeClient.getRecentArrivals).toBeCalledWith(res.locals.user.activeCaseLoadId, dateFrom, dateTo)
    })

    it('WelcomeClientFactory is called with a token', async () => {
      await service.getRecentArrivalsGroupedByDate(res.locals.user.activeCaseLoadId)

      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(WelcomeClientFactory).toBeCalledWith(token)
    })
  })

  describe('getRecentArrivalsSearchResults', () => {
    const today = moment().startOf('day').format('YYYY-MM-DD')
    const searchQuery = 'John Doe'

    const result1 = createRecentArrival({ firstName: 'John', lastName: 'Doe', movementDateTime: `${today}T13:15:00` })
    const result2 = createRecentArrival({ firstName: 'Jim', lastName: 'Doe', movementDateTime: `${today}T15:15:00` })
    const result3 = createRecentArrival({ firstName: 'James', lastName: 'Doe', movementDateTime: `${today}T12:15:00` })

    beforeEach(() => {
      const recentArrivals = createRecentArrivalResponse({ content: [result1, result2, result3] })
      welcomeClient.getRecentArrivals.mockResolvedValue(recentArrivals)
    })

    it('Retrieves recent arrivals search results if search query present', async () => {
      const dateTo = moment().startOf('day')
      const dateFrom = moment().subtract(2, 'days').startOf('day')
      const result = await service.getRecentArrivalsSearchResults(res.locals.user.activeCaseLoadId, searchQuery)

      expect(result).toStrictEqual([result1, result2, result3])

      expect(welcomeClient.getRecentArrivals).toBeCalledWith(
        res.locals.user.activeCaseLoadId,
        dateFrom,
        dateTo,
        searchQuery
      )
    })

    it('WelcomeClientFactory is called with a token', async () => {
      await service.getRecentArrivalsSearchResults(res.locals.user.activeCaseLoadId, searchQuery)

      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(WelcomeClientFactory).toBeCalledWith(token)
    })
  })

  describe('getArrival', () => {
    it('Calls upstream service correctly', async () => {
      await service.getArrival('12345-67890')

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getArrival).toBeCalledWith('12345-67890')
    })

    it('Returns response of client', async () => {
      const arrival = createArrival()
      welcomeClient.getArrival.mockResolvedValue(arrival)

      const result = await service.getArrival('12345-67890')

      expect(result).toStrictEqual(arrival)
    })
  })

  describe('getPrisonDetailsForArrival', () => {
    it('Calls upstream service correctly', async () => {
      const arrival = createArrival()
      welcomeClient.getArrival.mockResolvedValue(arrival)
      const result = await service.getPrisonerDetailsForArrival('12345-67890')

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getArrival).toBeCalledWith('12345-67890')
      expect(result).toStrictEqual(createPotentialMatch(arrival.potentialMatches[0]))
    })
  })

  describe('confirm expected arrival', () => {
    const username = 'Bob'
    const newArrival: NewArrival = createNewArrival()

    beforeEach(() => {
      welcomeClient.getArrival.mockResolvedValue(createArrival())
    })

    it('Calls hmppsAuth correctly', async () => {
      await service.confirmArrival('MDI', username, '12345-67890', newArrival)

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalledWith(username)
    })

    it('Calls welcome api correctly', async () => {
      welcomeClient.confirmExpectedArrival.mockResolvedValue({ prisonNumber: 'A1234AA', location: 'AA-1' })

      const response = await service.confirmArrival('MDI', username, '12345-67890', newArrival)

      expect(response).toStrictEqual({ location: 'AA-1', prisonNumber: 'A1234AA' })
      expect(welcomeClient.confirmExpectedArrival).toBeCalledWith('12345-67890', {
        firstName: 'Jim',
        lastName: 'Smith',
        dateOfBirth: '1973-01-08',
        sex: 'NS',
        prisonId: 'MDI',
        imprisonmentStatus: 'RX',
        movementReasonCode: 'N',
        fromLocationId: 'REDCC',
        prisonNumber: 'A1234AA',
      })
    })

    it('raises event when confirmation was successful', async () => {
      welcomeClient.confirmExpectedArrival.mockResolvedValue({ prisonNumber: 'A1234AA', location: 'AA-1' })

      await service.confirmArrival('MDI', username, '12345-67890', newArrival)

      expect(raiseAnalyticsEvent).toBeCalledWith(
        'Add to the establishment roll',
        'Confirmed arrival',
        'AgencyId: MDI, From: Reading Court, Type: COURT,'
      )
    })

    it('does not raise event when confirmation was unsuccessful', async () => {
      welcomeClient.confirmExpectedArrival.mockResolvedValue(undefined)

      await service.confirmArrival('MDI', username, '12345-67890', newArrival)

      expect(raiseAnalyticsEvent).not.toHaveBeenCalled()
    })
  })

  describe('confirm unexpected arrival', () => {
    const username = 'Bob'
    const newArrival: NewArrival = createNewArrival({ expected: false })

    it('Calls hmppsAuth correctly', async () => {
      await service.confirmArrival('MDI', username, '12345-67890', newArrival)

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalledWith(username)
    })

    it('Calls welcome api correctly', async () => {
      welcomeClient.confirmUnexpectedArrival.mockResolvedValue(arrivalResponse)

      const response = await service.confirmArrival('MDI', username, '12345-67890', newArrival)

      expect(response).toStrictEqual(arrivalResponse)
      expect(welcomeClient.confirmUnexpectedArrival).toBeCalledWith({
        firstName: 'Jim',
        lastName: 'Smith',
        dateOfBirth: '1973-01-08',
        sex: 'NS',
        prisonId: 'MDI',
        imprisonmentStatus: 'RX',
        movementReasonCode: 'N',
        prisonNumber: 'A1234AA',
      })
    })

    it('raises event when confirmation was successful', async () => {
      welcomeClient.confirmUnexpectedArrival.mockResolvedValue(arrivalResponse)

      await service.confirmArrival('MDI', username, '12345-67890', newArrival)

      expect(raiseAnalyticsEvent).toBeCalledWith(
        'Add to the establishment roll',
        'Confirmed unexpected arrival',
        'AgencyId: MDI'
      )
    })

    it('does not raise event when confirmation was unsuccessful', async () => {
      welcomeClient.getArrival.mockResolvedValue(createArrival())
      welcomeClient.confirmExpectedArrival.mockResolvedValue(undefined)

      await service.confirmArrival('MDI', username, '12345-67890', newArrival)

      expect(raiseAnalyticsEvent).not.toHaveBeenCalled()
    })
  })

  describe('confirmCourtReturn', () => {
    it('Calls upstream services correctly', async () => {
      await service.confirmCourtReturn('user1', '12345-67890', 'MDI', 'A1234AA')

      expect(hmppsAuthClient.getSystemClientToken).toBeCalledWith('user1')
      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.confirmCourtReturn).toBeCalledWith('12345-67890', 'MDI', 'A1234AA')
    })

    it('Should return null', async () => {
      welcomeClient.confirmCourtReturn.mockResolvedValue(null)

      const result = await service.confirmCourtReturn('user1', '12345-67890', 'MDI', 'A1234AA')
      expect(result).toBe(null)
    })
  })

  describe('matching records', () => {
    it('calls upstream service with correct args', async () => {
      const criteria = createMatchCriteria()

      await service.getMatchingRecords(criteria)

      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getMatchingRecords).toBeCalledWith(criteria)
    })
  })

  describe('get prisoner details', () => {
    it('calls upstream service with correct args', async () => {
      const prisonNumber = 'A1234BC'

      await service.getPrisonerDetails(prisonNumber)

      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getPrisonerDetails).toBeCalledWith(prisonNumber)
    })
  })
})
