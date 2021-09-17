import moment from 'moment'
import type { Movement } from 'welcome'
import IncomingMovementsService from './incomingMovementsService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import WelcomeClient from '../data/welcomeClient'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/welcomeClient')

const token = 'some token'

describe('Incoming movements service', () => {
  let welcomeClient: jest.Mocked<WelcomeClient>
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let service: IncomingMovementsService

  const WelcomeClientFactory = jest.fn()

  const incomingMovements: Movement[] = [
    {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1971-01-01',
      prisonNumber: 'G0013AB',
      pncNumber: '01/3456A',
      date: '2021-09-01',
      fromLocation: 'Reading',
      moveType: 'PRISON_REMAND',
    },
    {
      firstName: 'Karl',
      lastName: 'Offender',
      dateOfBirth: '1985-01-01',
      prisonNumber: 'G0015GD',
      pncNumber: '01/5678A',
      date: '2021-09-01',
      fromLocation: 'Leeds',
      moveType: 'PRISON_TRANSFER',
    },
    {
      firstName: 'Mark',
      lastName: 'Prisoner',
      dateOfBirth: '1985-01-05',
      prisonNumber: 'G0016GD',
      pncNumber: '01/6789A',
      date: '2021-09-01',
      fromLocation: 'Coventry',
      moveType: 'PRISON_RECALL',
    },
    {
      firstName: 'Barry',
      lastName: 'Smith',
      dateOfBirth: '1970-01-01',
      prisonNumber: 'G0012HK',
      pncNumber: '01/2345A',
      date: '2021-09-01',
      fromLocation: 'Sheffield',
      moveType: 'PRISON_RECALL',
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      dateOfBirth: '1970-01-01',
      prisonNumber: 'G0012BK',
      pncNumber: '01/2345A',
      date: '2021-09-01',
      fromLocation: 'Wandsworth',
      moveType: 'VIDEO_REMAND',
    },
    {
      firstName: 'Sam',
      lastName: 'Smith',
      dateOfBirth: '1970-02-01',
      prisonNumber: 'G0014GM',
      pncNumber: '01/4567A',
      date: '2021-09-01',
      fromLocation: 'Leeds',
      moveType: 'PRISON_REMAND',
    },
  ]

  const incomingMovementsGroupedByType = new Map()
  incomingMovementsGroupedByType.set('FROM_COURT', [
    {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1971-01-01',
      prisonNumber: 'G0013AB',
      pncNumber: '01/3456A',
      date: '2021-09-01',
      fromLocation: 'Reading',
      moveType: 'PRISON_REMAND',
    },
    {
      firstName: 'Sam',
      lastName: 'Smith',
      dateOfBirth: '1970-02-01',
      prisonNumber: 'G0014GM',
      pncNumber: '01/4567A',
      date: '2021-09-01',
      fromLocation: 'Leeds',
      moveType: 'PRISON_REMAND',
    },
  ])
  incomingMovementsGroupedByType.set('OTHER', [
    {
      firstName: 'Karl',
      lastName: 'Offender',
      dateOfBirth: '1985-01-01',
      prisonNumber: 'G0015GD',
      pncNumber: '01/5678A',
      date: '2021-09-01',
      fromLocation: 'Leeds',
      moveType: 'PRISON_TRANSFER',
    },
  ])
  incomingMovementsGroupedByType.set('FROM_CUSTODY_SUITE', [
    {
      firstName: 'Mark',
      lastName: 'Prisoner',
      dateOfBirth: '1985-01-05',
      prisonNumber: 'G0016GD',
      pncNumber: '01/6789A',
      date: '2021-09-01',
      fromLocation: 'Coventry',
      moveType: 'PRISON_RECALL',
    },
    {
      firstName: 'Barry',
      lastName: 'Smith',
      dateOfBirth: '1970-01-01',
      prisonNumber: 'G0012HK',
      pncNumber: '01/2345A',
      date: '2021-09-01',
      fromLocation: 'Sheffield',
      moveType: 'PRISON_RECALL',
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      dateOfBirth: '1970-01-01',
      prisonNumber: 'G0012BK',
      pncNumber: '01/2345A',
      date: '2021-09-01',
      fromLocation: 'Wandsworth',
      moveType: 'VIDEO_REMAND',
    },
  ])

  const res = { locals: { user: { activeCaseLoadId: 'MDI' } } }

  beforeEach(() => {
    jest.resetAllMocks()
    hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    welcomeClient = new WelcomeClient(null) as jest.Mocked<WelcomeClient>
    WelcomeClientFactory.mockReturnValue(welcomeClient)
    service = new IncomingMovementsService(hmppsAuthClient, WelcomeClientFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
    welcomeClient.getIncomingMovements.mockResolvedValue(incomingMovements)
  })

  describe('getIncomingMovements', () => {
    it('Retrieves incoming movements sorted alphabetically by name', async () => {
      const today = moment()
      const result = await service.getMovesForToday(res.locals.user.activeCaseLoadId, () => today)

      expect(result).toStrictEqual(incomingMovementsGroupedByType)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(welcomeClient.getIncomingMovements).toBeCalledWith(res.locals.user.activeCaseLoadId, today)
    })

    it('WelcomeClientFactory is called with a token', async () => {
      await service.getMovesForToday(res.locals.user.activeCaseLoadId)

      expect(WelcomeClientFactory).toBeCalledWith(token)
    })
  })

  describe('getSortedMovmentsByType', () => {
    it('Retrieves incoming movements grouped by type', async () => {
      const result = await service.getMovesForToday(res.locals.user.activeCaseLoadId)

      expect(result).toEqual(incomingMovementsGroupedByType)
    })
  })
})
