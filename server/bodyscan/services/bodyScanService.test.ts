import { BodyScan } from 'body-scan'
import { createMockHmppsAuthClient } from '../../data/__testutils/mocks'
import { BodyScanClient } from '../data'
import BodyScanService from './bodyScanService'

jest.mock('../data')

const token = 'some token'

describe('Body scan service', () => {
  const bodyScanClient = new BodyScanClient(null) as jest.Mocked<BodyScanClient>
  const hmppsAuthClient = createMockHmppsAuthClient()
  let service: BodyScanService

  const BodyScanClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
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
