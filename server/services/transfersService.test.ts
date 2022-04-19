import TransfersService from './transfersService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import WelcomeClient from '../data/welcomeClient'
import { createTransfer } from '../data/__testutils/testObjects'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/welcomeClient')

const token = 'some token'

const transfer = createTransfer()

describe('Transfers service', () => {
  let welcomeClient: jest.Mocked<WelcomeClient>
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let service: TransfersService

  const WelcomeClientFactory = jest.fn()

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

      expect(result).toStrictEqual(transfer)
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
