import ImprisonmentStatusesService from './imprisonmentStatusesService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import WelcomeClient from '../data/welcomeClient'
import { createImprisonmentStatuses } from '../data/__testutils/testObjects'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/welcomeClient')

const token = 'some token'

describe('Imprisonment statuses service', () => {
  let welcomeClient: jest.Mocked<WelcomeClient>
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let service: ImprisonmentStatusesService

  const WelcomeClientFactory = jest.fn()

  const imprisonmentStatuses = createImprisonmentStatuses()

  beforeEach(() => {
    jest.resetAllMocks()
    hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    welcomeClient = new WelcomeClient(null) as jest.Mocked<WelcomeClient>
    WelcomeClientFactory.mockReturnValue(welcomeClient)
    service = new ImprisonmentStatusesService(hmppsAuthClient, WelcomeClientFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
    welcomeClient.getImprisonmentStatuses.mockResolvedValue(imprisonmentStatuses)
  })

  describe('imprisonment statuses', () => {
    describe('getAllImprisonmentStatuses', () => {
      it('WelcomeClientFactory is called with a token', async () => {
        await service.getAllImprisonmentStatuses()

        expect(WelcomeClientFactory).toBeCalledWith(token)
      })
      it('Retrieves all imprisonment statuses', async () => {
        const result = await service.getAllImprisonmentStatuses()

        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
        expect(welcomeClient.getImprisonmentStatuses).toBeCalled()
        expect(result).toStrictEqual(imprisonmentStatuses)
      })
    })

    describe('getImprisonmentStatus', () => {
      it('WelcomeClientFactory is called with a token', async () => {
        await service.getImprisonmentStatus('convicted-unsentenced')

        expect(WelcomeClientFactory).toBeCalledWith(token)
      })

      it('should return imprisonment status with single movement reason', async () => {
        const imprisonmentStatus = imprisonmentStatuses.find(s => s.code === 'convicted-unsentenced')

        const result = await service.getImprisonmentStatus('convicted-unsentenced')

        expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
        expect(welcomeClient.getImprisonmentStatuses).toBeCalled()
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
        const result = await service.getReasonForImprisonment(statusAndReason)

        expect(result).toStrictEqual('Convicted - waiting to be sentenced')
      })
      it('should include movement reason description when one of multiple movement reasons selected', async () => {
        const statusAndReason = {
          code: 'determinate-sentence',
          imprisonmentStatus: 'SENT',
          movementReasonCode: 'I',
        }
        const result = await service.getReasonForImprisonment(statusAndReason)

        expect(result).toStrictEqual('Sentenced - fixed length of time - Imprisonment without option of a fine')
      })
    })
  })
})
