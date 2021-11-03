import { ImprisonmentStatus } from 'welcome'
import ImprisonmentStatusesService from './imprisonmentStatusesService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import WelcomeClient from '../data/welcomeClient'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/welcomeClient')

const token = 'some token'

describe('Imprisonment statuses service', () => {
  let welcomeClient: jest.Mocked<WelcomeClient>
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let service: ImprisonmentStatusesService

  const WelcomeClientFactory = jest.fn()

  const imprisonmentStatuses: ImprisonmentStatus[] = [
    {
      description: 'On remand',
      imprisonmentStatusCode: 'RX',
      movementReasons: [{ movementReasonCode: 'R' }],
    },
    {
      description: 'Convicted unsentenced',
      imprisonmentStatusCode: 'JR',
      movementReasons: [{ movementReasonCode: 'V' }],
    },
    {
      description: 'Determinate sentence',
      imprisonmentStatusCode: 'SENT',
      secondLevelTitle: 'What is the type of determinate sentence?',
      movementReasons: [
        { description: 'Extended sentence for public protection', movementReasonCode: '26' },
        { description: 'Imprisonment without option of a fine', movementReasonCode: 'I' },
        { description: 'Intermittent custodial sentence', movementReasonCode: 'INTER' },
        { description: 'Partly suspended sentence', movementReasonCode: 'P' },
      ],
    },
  ]

  beforeEach(() => {
    jest.resetAllMocks()
    hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    welcomeClient = new WelcomeClient(null) as jest.Mocked<WelcomeClient>
    WelcomeClientFactory.mockReturnValue(welcomeClient)
    service = new ImprisonmentStatusesService(hmppsAuthClient, WelcomeClientFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
    welcomeClient.getImprisonmentStatuses.mockResolvedValue(imprisonmentStatuses)
  })

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
      await service.getImprisonmentStatus('Convicted unsentenced')

      expect(WelcomeClientFactory).toBeCalledWith(token)
    })

    it('should return imprisonment status with single movement reason', async () => {
      const imprisonmentStatus = {
        description: 'Convicted unsentenced',
        imprisonmentStatusCode: 'JR',
        movementReasons: [{ movementReasonCode: 'V' }],
      }

      const result = await service.getImprisonmentStatus('Convicted unsentenced')

      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(welcomeClient.getImprisonmentStatuses).toBeCalled()
      expect(result).toStrictEqual(imprisonmentStatus)
    })

    it('should return imprisonment status with multiple movement reasons', async () => {
      const imprisonmentStatus = {
        description: 'Determinate sentence',
        imprisonmentStatusCode: 'SENT',
        secondLevelTitle: 'What is the type of determinate sentence?',
        movementReasons: [
          { description: 'Extended sentence for public protection', movementReasonCode: '26' },
          { description: 'Imprisonment without option of a fine', movementReasonCode: 'I' },
          { description: 'Intermittent custodial sentence', movementReasonCode: 'INTER' },
          { description: 'Partly suspended sentence', movementReasonCode: 'P' },
        ],
      }
      const result = await service.getImprisonmentStatus('Determinate sentence')

      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(welcomeClient.getImprisonmentStatuses).toBeCalled()
      expect(result).toStrictEqual(imprisonmentStatus)
    })
  })
})
