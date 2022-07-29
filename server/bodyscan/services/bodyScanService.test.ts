import { BodyScan } from 'body-scan'
import { HmppsAuthClient } from '../../data'
import { BodyScanClient } from '../data'
import BodyScanService from './bodyScanService'

jest.mock('../../data')
jest.mock('../data')

const token = 'some token'

describe('Body scan service', () => {
  let bodyScanClient: jest.Mocked<BodyScanClient>
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let service: BodyScanService

  const BodyScanClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    bodyScanClient = new BodyScanClient(null) as jest.Mocked<BodyScanClient>
    BodyScanClientFactory.mockReturnValue(bodyScanClient)
    service = new BodyScanService(hmppsAuthClient, BodyScanClientFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  describe('get prisoner details', () => {
    it('calls upstream service with correct args', async () => {
      const prisonNumber = 'A1234BC'

      await service.getPrisonerDetails(prisonNumber)

      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(BodyScanClientFactory).toBeCalledWith(token)
      expect(bodyScanClient.getPrisonerDetails).toBeCalledWith(prisonNumber)
    })
  })

  describe('add body scan', () => {
    it('calls upstream service with correct args', async () => {
      const prisonNumber = 'A1234BC'
      const bodyScan: BodyScan = { date: '2020-02-20', reason: 'INTELLIGENCE', result: 'POSITIVE' }

      await service.addBodyScan(prisonNumber, bodyScan)

      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(BodyScanClientFactory).toBeCalledWith(token)
      expect(bodyScanClient.addBodyScan).toBeCalledWith(prisonNumber, bodyScan)
    })
  })
})
