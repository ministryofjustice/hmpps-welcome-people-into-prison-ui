import TransfersService from './transfersService'
import { createTransfer } from '../data/__testutils/testObjects'
import { createMockHmppsAuthClient, createMockWelcomeClient } from '../data/__testutils/mocks'

const token = 'some token'

const transfer = createTransfer()

describe('Transfers service', () => {
  const welcomeClient = createMockWelcomeClient()
  const hmppsAuthClient = createMockHmppsAuthClient()
  let service: TransfersService

  const WelcomeClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
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
      await service.confirmTransfer('user1', 'G0015GD', 'MDI')

      expect(hmppsAuthClient.getSystemClientToken).toBeCalledWith('user1')
      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.confirmTransfer).toBeCalledWith('G0015GD', 'MDI', undefined)
    })

    it('Calls upstream services correctly when arrivalId present', async () => {
      await service.confirmTransfer('user1', 'G0015GD', 'MDI', 'abc-123')

      expect(hmppsAuthClient.getSystemClientToken).toBeCalledWith('user1')
      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.confirmTransfer).toBeCalledWith('G0015GD', 'MDI', 'abc-123')
    })

    it('Should return null', async () => {
      welcomeClient.confirmTransfer.mockResolvedValue(null)

      const result = await service.confirmTransfer('user1', 'G0015GD', 'MDI')
      expect(result).toBe(null)
    })
  })
})
