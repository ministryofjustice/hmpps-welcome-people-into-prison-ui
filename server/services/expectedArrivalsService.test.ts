import moment from 'moment'
import type { Arrival } from 'welcome'
import ExpectedArrivalsService, { LocationType } from './expectedArrivalsService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import WelcomeClient from '../data/welcomeClient'
import { NewArrival } from '../routes/bookedtoday/arrivals/state'
import { raiseAnalyticsEvent } from './raiseAnalyticsEvent'
import {
  createArrival,
  createArrivalResponse,
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
      const result = await service.getArrivalsForToday(res.locals.user.activeCaseLoadId, () => today)

      expect(result).toStrictEqual(
        new Map([
          [
            LocationType.COURT,
            [createArrival({ fromLocationType: 'COURT' }), createArrival({ fromLocationType: 'COURT' })],
          ],
          [LocationType.PRISON, [transferArrival]],
          [
            LocationType.CUSTODY_SUITE,
            [
              createArrival({ fromLocationType: 'CUSTODY_SUITE' }),
              createArrival({ fromLocationType: 'CUSTODY_SUITE' }),
              createArrival({ fromLocationType: 'CUSTODY_SUITE' }),
            ],
          ],
          [LocationType.OTHER, [createArrival({ fromLocationType: 'OTHER' })]],
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
