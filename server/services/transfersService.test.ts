import { Transfer } from 'welcome'
import TransfersService from './transfersService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import WelcomeClient from '../data/welcomeClient'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/welcomeClient')

const token = 'some token'

describe('Transfers service', () => {
  let welcomeClient: jest.Mocked<WelcomeClient>
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let service: TransfersService

  const WelcomeClientFactory = jest.fn()

  const transfer: Transfer = {
    firstName: 'Karl',
    lastName: 'Offender',
    dateOfBirth: '1985-01-01',
    prisonNumber: 'G0015GD',
    pncNumber: '01/5678A',
    date: '2021-09-01',
    fromLocation: 'Leeds',
  }

  beforeEach(() => {
    jest.resetAllMocks()
    hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    welcomeClient = new WelcomeClient(null) as jest.Mocked<WelcomeClient>
    WelcomeClientFactory.mockReturnValue(welcomeClient)
    service = new TransfersService(hmppsAuthClient, WelcomeClientFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
    welcomeClient.getTransfer.mockResolvedValue(transfer)
  })

  describe('getTransfer', () => {
    it('Calls upstream service correctly', async () => {
      await service.getTransfer('MDI', 'G0015GD')

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getTransfer).toBeCalledWith('MDI', 'G0015GD')
    })

    it('Should return correct data', async () => {
      const result = await service.getTransfer('MDI', 'G0015GD')

      expect(result).toStrictEqual({
        date: '2021-09-01',
        dateOfBirth: '1985-01-01',
        firstName: 'Karl',
        fromLocation: 'Leeds',
        lastName: 'Offender',
        pncNumber: '01/5678A',
        prisonNumber: 'G0015GD',
      })
    })
  })

  describe('confirmTransfer', () => {
    it('Calls upstream services correctly', async () => {
      await service.confirmTransfer('user1', 'G0015GD')

      expect(hmppsAuthClient.getSystemClientToken).toBeCalledWith('user1')
      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.confirmTransfer).toBeCalledWith('G0015GD')
    })
  })
})
