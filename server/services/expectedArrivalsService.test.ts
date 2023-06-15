import moment from 'moment'
import { type Arrival } from 'welcome'
import ExpectedArrivalsService from './expectedArrivalsService'
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
  createPrisonerDetails,
  createTransfer,
  withBodyScanStatus,
  withBodyScanInfo,
  withMatchType,
} from '../data/__testutils/testObjects'
import { createMockHmppsAuthClient, createMockWelcomeClient } from '../data/__testutils/mocks'
import { createMockBodyScanInfoDecorator, createMockMatchTypeDecorator } from './__testutils/mocks'
import { MatchType } from './matchTypeDecorator'

jest.mock('./raiseAnalyticsEvent')

const token = 'some token'
const username = 'user1'

describe('Expected arrivals service', () => {
  const welcomeClient = createMockWelcomeClient()
  const hmppsAuthClient = createMockHmppsAuthClient()
  const bodyScanInfoDecorator = createMockBodyScanInfoDecorator()
  const matchTypeDecorator = createMockMatchTypeDecorator()
  let service: ExpectedArrivalsService

  const WelcomeClientFactory = jest.fn()

  const arrivalResponse = createArrivalResponse()

  const res = { locals: { user: { activeCaseLoadId: 'MDI' } } }

  beforeEach(() => {
    jest.resetAllMocks()
    WelcomeClientFactory.mockReturnValue(welcomeClient)
    service = new ExpectedArrivalsService(
      hmppsAuthClient,
      WelcomeClientFactory,
      raiseAnalyticsEvent,
      bodyScanInfoDecorator,
      matchTypeDecorator
    )
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
    bodyScanInfoDecorator.decorate.mockImplementation(as =>
      Promise.resolve(as.map(a => ({ ...a, bodyScanStatus: 'OK_TO_SCAN' })))
    )
    bodyScanInfoDecorator.decorateSingle.mockImplementation(as =>
      Promise.resolve({
        ...as,
        numberOfBodyScans: 0,
        numberOfBodyScansRemaining: 116,
        bodyScanStatus: 'OK_TO_SCAN',
      })
    )
    matchTypeDecorator.decorate.mockImplementation(as => as.map(a => ({ ...a, matchType: MatchType.SINGLE_MATCH })))
    matchTypeDecorator.decorateSingle.mockImplementation(a => ({ ...a, matchType: MatchType.SINGLE_MATCH }))
  })

  describe('getExpectedArrivals', () => {
    const transferArrival: Arrival = {
      ...createTransfer(),
      isCurrentPrisoner: true,
      fromLocationType: 'PRISON',
    }

    beforeEach(() => {
      const arrivals = [
        createArrival({ fromLocationType: 'COURT' }),
        createArrival({ fromLocationType: 'CUSTODY_SUITE' }),
        createArrival({ fromLocationType: 'CUSTODY_SUITE' }),
        createArrival({ fromLocationType: 'CUSTODY_SUITE' }),
        createArrival({ fromLocationType: 'COURT' }),
        createArrival({ fromLocationType: 'OTHER' }),
      ]

      welcomeClient.getTransfers.mockResolvedValue([transferArrival])
      welcomeClient.getExpectedArrivals.mockResolvedValue(arrivals)
    })

    it('Retrieves expected arrivals sorted alphabetically by name', async () => {
      const today = moment()
      const result = await service.getArrivalsForToday(username, res.locals.user.activeCaseLoadId, () => today)

      const arrival = (a: Parameters<typeof createArrival>[0]) => withMatchType(withBodyScanStatus(createArrival(a)))

      expect(result).toStrictEqual(
        new Map([
          ['COURT', [arrival({ fromLocationType: 'COURT' }), arrival({ fromLocationType: 'COURT' })]],
          ['PRISON', [withMatchType(withBodyScanStatus(transferArrival))]],
          [
            'CUSTODY_SUITE',
            [
              arrival({ fromLocationType: 'CUSTODY_SUITE' }),
              arrival({ fromLocationType: 'CUSTODY_SUITE' }),
              arrival({ fromLocationType: 'CUSTODY_SUITE' }),
            ],
          ],
          ['OTHER', [arrival({ fromLocationType: 'OTHER' })]],
        ])
      )

      expect(welcomeClient.getExpectedArrivals).toBeCalledWith(res.locals.user.activeCaseLoadId, today)
      expect(welcomeClient.getTransfers).toBeCalledWith(res.locals.user.activeCaseLoadId)
    })

    it('WelcomeClientFactory is called with a token', async () => {
      await service.getArrivalsForToday(username, res.locals.user.activeCaseLoadId)

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
              withBodyScanStatus(createRecentArrival({ movementDateTime: `${today}T13:16:00` })),
              withBodyScanStatus(createRecentArrival({ movementDateTime: `${today}T13:15:00` })),
              withBodyScanStatus(createRecentArrival({ movementDateTime: `${today}T09:12:00` })),
            ],
          ],
          [
            middleDate,
            [
              withBodyScanStatus(createRecentArrival({ movementDateTime: `${oneDayAgo}T14:55:00` })),
              withBodyScanStatus(createRecentArrival({ movementDateTime: `${oneDayAgo}T14:40:01` })),
              withBodyScanStatus(createRecentArrival({ movementDateTime: `${oneDayAgo}T14:40:00` })),
            ],
          ],
          [dateFrom, [withBodyScanStatus(createRecentArrival({ movementDateTime: `${twoDaysAgo}T18:20:00` }))]],
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
      await service.getArrival(username, '12345-67890')

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getArrival).toBeCalledWith('12345-67890')
    })

    it('Returns response of client', async () => {
      const arrival = createArrival()
      welcomeClient.getArrival.mockResolvedValue(arrival)

      const result = await service.getArrival(username, '12345-67890')

      expect(result).toStrictEqual({ ...arrival, matchType: MatchType.SINGLE_MATCH })
    })
  })

  describe('getPrisonDetailsForArrival', () => {
    it('Calls upstream service correctly', async () => {
      const arrival = createArrival()
      welcomeClient.getArrival.mockResolvedValue(arrival)
      const result = await service.getPrisonerDetailsForArrival(username, '12345-67890')

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getArrival).toBeCalledWith('12345-67890')
      expect(result).toStrictEqual(createPotentialMatch(arrival.potentialMatches[0]))
    })
  })

  describe('getArrivalAndSummaryDetails', () => {
    it('Calls upstream service correctly', async () => {
      const arrival = createArrival({ potentialMatches: [createPotentialMatch({ prisonNumber: 'A1234AB' })] })
      const prisonerSummaryDetails = withBodyScanInfo(createPrisonerDetails())

      welcomeClient.getArrival.mockResolvedValue(arrival)
      welcomeClient.getPrisonerDetails.mockResolvedValue(createPrisonerDetails())

      const result = await service.getArrivalAndSummaryDetails(username, '12345-67890')

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getArrival).toBeCalledWith('12345-67890')
      expect(welcomeClient.getPrisonerDetails).toBeCalledWith('A1234AB')

      expect(result).toStrictEqual({
        arrival: withMatchType(arrival),
        summary: {
          ...prisonerSummaryDetails,
          numberOfBodyScans: 0,
          numberOfBodyScansRemaining: 116,
          bodyScanStatus: 'OK_TO_SCAN',
        },
      })
    })
  })

  describe('confirm expected arrival', () => {
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
      await service.confirmCourtReturn(username, '12345-67890', 'MDI', 'A1234AA')

      expect(hmppsAuthClient.getSystemClientToken).toBeCalledWith(username)
      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.confirmCourtReturn).toBeCalledWith('12345-67890', 'MDI', 'A1234AA')
    })

    it('Should return null', async () => {
      welcomeClient.confirmCourtReturn.mockResolvedValue(null)

      const result = await service.confirmCourtReturn(username, '12345-67890', 'MDI', 'A1234AA')
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

  describe('get prisoner summary details', () => {
    it('calls upstream service with correct args', async () => {
      const prisonNumber = 'A1234AB'

      await service.getPrisonerSummaryDetails(prisonNumber)

      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getPrisonerDetails).toBeCalledWith(prisonNumber)
    })

    it('Returns response of client', async () => {
      const prisonerSummaryDetails = createPrisonerDetails()
      welcomeClient.getPrisonerDetails.mockResolvedValue(prisonerSummaryDetails)

      const result = await service.getPrisonerSummaryDetails('A1234AB')

      expect(result).toStrictEqual({
        ...prisonerSummaryDetails,
        numberOfBodyScans: 0,
        numberOfBodyScansRemaining: 116,
        bodyScanStatus: 'OK_TO_SCAN',
      })
    })
  })
})
