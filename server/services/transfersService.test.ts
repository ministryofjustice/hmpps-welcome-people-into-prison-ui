import TransfersService from './transfersService'
import { createTransfer } from '../data/__testutils/testObjects'
import { createMockWelcomeClient } from '../data/__testutils/mocks'
import { createMockBodyScanInfoDecorator } from './__testutils/mocks'

const token = 'some token'

const transfer = createTransfer()
const confirmTransferMockedResult = {
  prisonNumber: 'G0015GD',
  location: 'MDI',
}

describe('Transfers service', () => {
  const welcomeClient = createMockWelcomeClient()
  const bodyScanInfoDecorator = createMockBodyScanInfoDecorator()

  let service: TransfersService

  beforeEach(() => {
    jest.resetAllMocks()
    service = new TransfersService(welcomeClient, bodyScanInfoDecorator)
    welcomeClient.getTransfer.mockResolvedValue(transfer)
  })

  describe('getTransfer', () => {
    it('Calls upstream service correctly', async () => {
      await service.getTransfer(token, 'MDI', 'G0015GD')

      expect(welcomeClient.getTransfer).toHaveBeenCalledWith(token, {
        agencyId: 'MDI',
        prisonNumber: 'G0015GD',
      })
    })
  })

  describe('getTransferWithBodyScanDetails', () => {
    it('Calls upstream service correctly', async () => {
      welcomeClient.getTransfer.mockResolvedValue(transfer)

      await service.getTransferWithBodyScanDetails(token, 'MDI', 'A1234AA')

      expect(welcomeClient.getTransfer).toHaveBeenCalledWith(token, { agencyId: 'MDI', prisonNumber: 'A1234AA' })
      expect(bodyScanInfoDecorator.decorateSingle).toHaveBeenCalledWith(token, {
        firstName: 'Sam',
        lastName: 'Smith',
        prisonNumber: 'A1234AA',
        pncNumber: '01/1234X',
        date: '2020-02-23',
        dateOfBirth: '1971-02-01',
        fromLocation: 'Kingston-upon-Hull Crown Court',
        mainOffence: 'theft',
      })
    })
  })

  describe('confirmTransfer', () => {
    it('calls welcomeClient.confirmTransfer with correct params without arrivalId', async () => {
      welcomeClient.confirmTransfer.mockResolvedValue(confirmTransferMockedResult)

      const result = await service.confirmTransfer(token, 'G0015GD', 'MDI')

      expect(welcomeClient.confirmTransfer).toHaveBeenCalledWith(
        token,
        { prisonNumber: 'G0015GD' },
        { prisonId: 'MDI', arrivalId: undefined },
      )
      expect(result).toEqual(confirmTransferMockedResult)
    })

    it('Calls upstream services correctly when arrivalId present', async () => {
      welcomeClient.confirmTransfer.mockResolvedValue(confirmTransferMockedResult)

      const result = await service.confirmTransfer(token, 'G0015GD', 'MDI', 'abc-123')

      expect(welcomeClient.confirmTransfer).toHaveBeenCalledWith(
        token,
        { prisonNumber: 'G0015GD' },
        { prisonId: 'MDI', arrivalId: 'abc-123' },
      )
      expect(result).toEqual(confirmTransferMockedResult)
    })

    it('Should return null', async () => {
      welcomeClient.confirmTransfer.mockResolvedValue(null)

      const result = await service.confirmTransfer(token, 'G0015GD', 'MDI')
      expect(result).toBe(null)
    })
  })
})
