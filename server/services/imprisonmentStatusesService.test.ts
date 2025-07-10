import ImprisonmentStatusesService from './imprisonmentStatusesService'
import { createImprisonmentStatuses } from '../data/__testutils/testObjects'
import { createMockWelcomeClient } from '../data/__testutils/mocks'

describe('Imprisonment statuses service', () => {
  const welcomeClient = createMockWelcomeClient()
  const token = 'some-token'
  let service: ImprisonmentStatusesService

  const WelcomeClient = jest.fn()

  const imprisonmentStatuses = createImprisonmentStatuses()

  beforeEach(() => {
    jest.resetAllMocks()
    WelcomeClient.mockReturnValue(welcomeClient)
    service = new ImprisonmentStatusesService(welcomeClient)
    welcomeClient.getImprisonmentStatuses.mockResolvedValue(imprisonmentStatuses)
  })

  describe('imprisonment statuses', () => {
    describe('getAllImprisonmentStatuses', () => {
      it('Retrieves all imprisonment statuses', async () => {
        const result = await service.getAllImprisonmentStatuses(token)

        expect(welcomeClient.getImprisonmentStatuses).toHaveBeenCalled()
        expect(result).toStrictEqual(imprisonmentStatuses)
      })
    })

    describe('getImprisonmentStatus', () => {
      it('should return imprisonment status with single movement reason', async () => {
        const imprisonmentStatus = imprisonmentStatuses.find(s => s.code === 'convicted-unsentenced')

        const result = await service.getImprisonmentStatus(token, 'convicted-unsentenced')

        expect(welcomeClient.getImprisonmentStatuses).toHaveBeenCalled()
        expect(result).toStrictEqual(imprisonmentStatus)
      })
    })

    describe('getReasonForImprisonment', () => {
      it('should include imprisonment status description only when singular movement reason selected', async () => {
        const statusAndReason = {
          code: 'convicted-unsentenced',
          imprisonmentStatus: 'JR',
          movementReasonCode: 'V',
        }
        const result = await service.getReasonForImprisonment(token, statusAndReason)

        expect(result).toStrictEqual('Convicted - waiting to be sentenced')
      })
      it('should include movement reason description when one of multiple movement reasons selected', async () => {
        const statusAndReason = {
          code: 'determinate-sentence',
          imprisonmentStatus: 'SENT',
          movementReasonCode: 'I',
        }
        const result = await service.getReasonForImprisonment(token, statusAndReason)

        expect(result).toStrictEqual('Sentenced - fixed length of time - Imprisonment without option of a fine')
      })
    })
  })
})
