import { Sex, type Arrival } from 'welcome'
import moment from 'moment'
import ExpectedArrivalsService, { LocationType } from './expectedArrivalsService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import WelcomeClient from '../data/welcomeClient'
import { NewArrival } from '../routes/bookedtoday/arrivals/state'
import { raiseAnalyticsEvent } from './raiseAnalyticsEvent'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/welcomeClient')
jest.mock('./raiseAnalyticsEvent')

const token = 'some token'

describe('Expected arrivals service', () => {
  let welcomeClient: jest.Mocked<WelcomeClient>
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let service: ExpectedArrivalsService

  const WelcomeClientFactory = jest.fn()

  const arrival = {
    firstName: 'James',
    lastName: 'Smyth',
    dateOfBirth: '1973-01-08',
    prisonNumber: 'A1234AB',
    pncNumber: '01/3456A',
    date: '2021-09-01',
    fromLocation: 'Reading',
    fromLocationType: 'COURT',
    potentialMatches: [
      {
        firstName: 'James',
        lastName: 'Smyth',
        dateOfBirth: '1973-01-08',
        prisonNumber: 'A1234AB',
        pncNumber: '99/98644M',
      },
    ],
  } as Arrival

  const arrivals = [
    {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1971-01-01',
      prisonNumber: 'G0013AB',
      pncNumber: '01/3456A',
      date: '2021-09-01',
      fromLocation: 'Reading',
      fromLocationType: 'COURT',
    },
    {
      firstName: 'Mark',
      lastName: 'Prisoner',
      dateOfBirth: '1985-01-05',
      prisonNumber: 'G0016GD',
      pncNumber: '01/6789A',
      date: '2021-09-01',
      fromLocation: 'Coventry',
      fromLocationType: 'CUSTODY_SUITE',
    },
    {
      firstName: 'Barry',
      lastName: 'Smith',
      dateOfBirth: '1970-01-01',
      prisonNumber: 'G0012HK',
      pncNumber: '01/2345A',
      date: '2021-09-01',
      fromLocation: 'Sheffield',
      fromLocationType: 'CUSTODY_SUITE',
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      dateOfBirth: '1970-01-01',
      prisonNumber: 'G0012BK',
      pncNumber: '01/2345A',
      date: '2021-09-01',
      fromLocation: 'Wandsworth',
      fromLocationType: 'CUSTODY_SUITE',
    },
    {
      firstName: 'Sam',
      lastName: 'Smith',
      dateOfBirth: '1970-02-01',
      prisonNumber: 'G0014GM',
      pncNumber: '01/4567A',
      date: '2021-09-01',
      fromLocation: 'Leeds',
      fromLocationType: 'COURT',
    },
    {
      firstName: 'Steve',
      lastName: 'Smith',
      dateOfBirth: '1985-05-05',
      prisonNumber: 'G0015GF',
      pncNumber: '01/5568B',
      date: '2021-09-01',
      fromLocation: 'Manchester',
      fromLocationType: 'OTHER',
    },
  ] as Arrival[]

  const transfers = [
    {
      firstName: 'Karl',
      lastName: 'Offender',
      dateOfBirth: '1985-01-01',
      prisonNumber: 'G0015GD',
      pncNumber: '01/5678A',
      date: '2021-09-01',
      fromLocation: 'Leeds',
      fromLocationType: 'PRISON',
    },
  ] as Arrival[]

  const expectedArrivalsGroupedByType = new Map()
  expectedArrivalsGroupedByType.set(LocationType.COURT, [
    {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1971-01-01',
      prisonNumber: 'G0013AB',
      pncNumber: '01/3456A',
      date: '2021-09-01',
      fromLocation: 'Reading',
      fromLocationType: 'COURT',
    },
    {
      firstName: 'Sam',
      lastName: 'Smith',
      dateOfBirth: '1970-02-01',
      prisonNumber: 'G0014GM',
      pncNumber: '01/4567A',
      date: '2021-09-01',
      fromLocation: 'Leeds',
      fromLocationType: 'COURT',
    },
  ])
  expectedArrivalsGroupedByType.set(LocationType.PRISON, [
    {
      firstName: 'Karl',
      lastName: 'Offender',
      dateOfBirth: '1985-01-01',
      prisonNumber: 'G0015GD',
      pncNumber: '01/5678A',
      date: '2021-09-01',
      fromLocation: 'Leeds',
      fromLocationType: 'PRISON',
    },
  ])
  expectedArrivalsGroupedByType.set(LocationType.CUSTODY_SUITE, [
    {
      firstName: 'Mark',
      lastName: 'Prisoner',
      dateOfBirth: '1985-01-05',
      prisonNumber: 'G0016GD',
      pncNumber: '01/6789A',
      date: '2021-09-01',
      fromLocation: 'Coventry',
      fromLocationType: 'CUSTODY_SUITE',
    },
    {
      firstName: 'Barry',
      lastName: 'Smith',
      dateOfBirth: '1970-01-01',
      prisonNumber: 'G0012HK',
      pncNumber: '01/2345A',
      date: '2021-09-01',
      fromLocation: 'Sheffield',
      fromLocationType: 'CUSTODY_SUITE',
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      dateOfBirth: '1970-01-01',
      prisonNumber: 'G0012BK',
      pncNumber: '01/2345A',
      date: '2021-09-01',
      fromLocation: 'Wandsworth',
      fromLocationType: 'CUSTODY_SUITE',
    },
  ])
  expectedArrivalsGroupedByType.set(LocationType.OTHER, [
    {
      firstName: 'Steve',
      lastName: 'Smith',
      dateOfBirth: '1985-05-05',
      prisonNumber: 'G0015GF',
      pncNumber: '01/5568B',
      date: '2021-09-01',
      fromLocation: 'Manchester',
      fromLocationType: 'OTHER',
    },
  ])

  const res = { locals: { user: { activeCaseLoadId: 'MDI' } } }

  beforeEach(() => {
    jest.resetAllMocks()
    hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    welcomeClient = new WelcomeClient(null) as jest.Mocked<WelcomeClient>
    WelcomeClientFactory.mockReturnValue(welcomeClient)
    service = new ExpectedArrivalsService(hmppsAuthClient, WelcomeClientFactory, raiseAnalyticsEvent)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
    welcomeClient.getArrival.mockResolvedValue(arrival)
    welcomeClient.getExpectedArrivals.mockResolvedValue(arrivals)
    welcomeClient.getTransfers.mockResolvedValue(transfers)
  })

  describe('getExpectedArrivals', () => {
    it('Retrieves expected arrivals sorted alphabetically by name', async () => {
      const today = moment()
      const result = await service.getArrivalsForToday(res.locals.user.activeCaseLoadId, () => today)

      expect(result).toStrictEqual(expectedArrivalsGroupedByType)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(welcomeClient.getExpectedArrivals).toBeCalledWith(res.locals.user.activeCaseLoadId, today)
      expect(welcomeClient.getTransfers).toBeCalledWith(res.locals.user.activeCaseLoadId)
    })

    it('WelcomeClientFactory is called with a token', async () => {
      await service.getArrivalsForToday(res.locals.user.activeCaseLoadId)

      expect(WelcomeClientFactory).toBeCalledWith(token)
    })
  })

  describe('getSortedArrivalsByType', () => {
    it('Retrieves expected arrivals grouped by type', async () => {
      const result = await service.getArrivalsForToday(res.locals.user.activeCaseLoadId)

      expect(result).toEqual(expectedArrivalsGroupedByType)
    })
  })

  describe('getArrival', () => {
    it('Calls upstream service correctly', async () => {
      await service.getArrival('12345-67890')

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getArrival).toBeCalledWith('12345-67890')
    })
    it('handles potential matches', async () => {
      const { potentialMatches } = await service.getArrival('')

      expect(potentialMatches[0]).toEqual({
        dateOfBirth: '1973-01-08',
        firstName: 'James',
        lastName: 'Smyth',
        pncNumber: '99/98644M',
        prisonNumber: 'A1234AB',
      })
    })
  })

  describe('getPrisonDetailsForArrival', () => {
    it('Calls upstream service correctly', async () => {
      const result = await service.getPrisonerDetailsForArrival('12345-67890')

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getArrival).toBeCalledWith('12345-67890')
      expect(result).toStrictEqual({
        dateOfBirth: '1973-01-08',
        firstName: 'James',
        lastName: 'Smyth',
        pncNumber: '99/98644M',
        prisonNumber: 'A1234AB',
      })
    })
  })

  describe('confirm expected arrival', () => {
    const username = 'Bob'
    const detail: NewArrival = {
      firstName: 'Jim',
      lastName: 'Smith',
      dateOfBirth: '1973-01-08',
      sex: Sex.NOT_SPECIFIED,
      imprisonmentStatus: 'RX',
      movementReasonCode: 'N',
      prisonNumber: 'A1234AA',
      expected: true,
    }

    it('Calls hmppsAuth correctly', async () => {
      await service.confirmArrival('MDI', username, '12345-67890', detail)

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalledWith(username)
    })

    it('Calls welcome api correctly', async () => {
      welcomeClient.confirmExpectedArrival.mockResolvedValue({ prisonNumber: 'A1234AA', location: 'AA-1' })

      const response = await service.confirmArrival('MDI', username, '12345-67890', detail)

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

      await service.confirmArrival('MDI', username, '12345-67890', detail)

      expect(raiseAnalyticsEvent).toBeCalledWith(
        'Add to the establishment roll',
        'Confirmed arrival',
        'AgencyId: MDI, From: Reading, Type: COURT,'
      )
    })

    it('does not raise event when confirmation was unsuccessful', async () => {
      welcomeClient.confirmExpectedArrival.mockResolvedValue(undefined)

      await service.confirmArrival('MDI', username, '12345-67890', detail)

      expect(raiseAnalyticsEvent).not.toHaveBeenCalled()
    })
  })

  describe('confirm unexpected arrival', () => {
    const username = 'Bob'
    const detail: NewArrival = {
      firstName: 'Jim',
      lastName: 'Smith',
      dateOfBirth: '1973-01-08',
      sex: Sex.NOT_SPECIFIED,
      imprisonmentStatus: 'RX',
      movementReasonCode: 'N',
      prisonNumber: 'A1234AA',
      expected: false,
    }

    it('Calls hmppsAuth correctly', async () => {
      await service.confirmArrival('MDI', username, '12345-67890', detail)

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalledWith(username)
    })

    it('Calls welcome api correctly', async () => {
      welcomeClient.confirmUnexpectedArrival.mockResolvedValue({ prisonNumber: 'A1234AA', location: 'AA-1' })

      const response = await service.confirmArrival('MDI', username, '12345-67890', detail)

      expect(response).toStrictEqual({ location: 'AA-1', prisonNumber: 'A1234AA' })
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
      welcomeClient.confirmUnexpectedArrival.mockResolvedValue({ prisonNumber: 'A1234AA', location: 'AA-1' })

      await service.confirmArrival('MDI', username, '12345-67890', detail)

      expect(raiseAnalyticsEvent).toBeCalledWith(
        'Add to the establishment roll',
        'Confirmed unexpected arrival',
        'AgencyId: MDI'
      )
    })

    it('does not raise event when confirmation was unsuccessful', async () => {
      welcomeClient.confirmExpectedArrival.mockResolvedValue(undefined)

      await service.confirmArrival('MDI', username, '12345-67890', detail)

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
      const potentialMatchCriteria = {
        firstName: arrival.firstName,
        lastName: arrival.lastName,
        dateOfBirth: arrival.dateOfBirth,
      }

      await service.getMatchingRecords(potentialMatchCriteria)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getMatchingRecords).toBeCalledWith(potentialMatchCriteria)
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
