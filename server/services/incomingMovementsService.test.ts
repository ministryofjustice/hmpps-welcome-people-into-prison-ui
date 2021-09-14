import moment from 'moment'
import type { Movement } from 'welcome'
import IncomingMovementsService from './incomingMovementsService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import WelcomeApi from '../api/welcomeApi'

jest.mock('../data/hmppsAuthClient')
jest.mock('../api/welcomeApi')

const token = 'some token'

describe('Incoming movements service', () => {
  let welcomeApi: jest.Mocked<WelcomeApi>
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let service: IncomingMovementsService

  const welcomeApiFactory = jest.fn()

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
    welcomeApi = new WelcomeApi(token) as jest.Mocked<WelcomeApi>
    welcomeApiFactory.mockReturnValue(welcomeApi)
    service = new IncomingMovementsService(hmppsAuthClient, welcomeApiFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
    welcomeApi.getIncomingMovements.mockResolvedValue(incomingMovements)
  })

  describe('getIncomingMovements', () => {
    it('Retrieves incoming movements sorted alphabetically by name', async () => {
      const today = moment.now().toString()
      const result = await service.getMovesForToday(res.locals.user.activeCaseLoadId)

      expect(result).toStrictEqual(incomingMovementsGroupedByType)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(welcomeApi.getIncomingMovements).toBeCalledWith(res.locals.user.activeCaseLoadId, today)
    })

    it('WelcomeApiFactory is called with a token', async () => {
      await service.getMovesForToday(res.locals.user.activeCaseLoadId)

      expect(welcomeApiFactory).toBeCalledWith(token)
    })
  })

  describe('getSortedMovmentsByType', () => {
    it('Retrieves incoming movements grouped by type', async () => {
      const result = await service.getMovesForToday(res.locals.user.activeCaseLoadId)

      expect(result).toEqual(incomingMovementsGroupedByType)
    })
  })
})
