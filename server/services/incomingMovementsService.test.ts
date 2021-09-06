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
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1971-01-01',
      prisonNumber: 'G0013AB',
      pncNumber: '01/3456A',
      date: '2021-09-01',
      fromLocation: 'Reading',
      moveType: 'PRISON_TRANSFER',
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
  ]

  describe('getIncomingMovements', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
      welcomeApi = new WelcomeApi(token) as jest.Mocked<WelcomeApi>
      welcomeApiFactory.mockReturnValue(welcomeApi)
      service = new IncomingMovementsService(hmppsAuthClient, welcomeApiFactory)
      hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
      welcomeApi.getIncomingMovements.mockResolvedValue(incomingMovements)
    })
    it('Retrieves incoming movements', async () => {
      const today = moment.now().toString()
      const result = await service.getIncomingMovements('MDI')

      expect(result).toStrictEqual(incomingMovements)
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(welcomeApi.getIncomingMovements).toBeCalledWith('MDI', today)
    })

    it('WelcomeApiFactory is called with a token', async () => {
      await service.getIncomingMovements('MDI')

      expect(welcomeApiFactory).toBeCalledWith(token)
    })
  })
})
