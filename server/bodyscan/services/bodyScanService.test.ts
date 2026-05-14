import type { BodyScan } from 'body-scan'
import { createMockHmppsAuthClient } from '../../data/__testutils/mocks'
import { BodyScanClient } from '../data'
import BodyScanService from './bodyScanService'

jest.mock('../data')

const token = 'some token'

describe('Body scan service', () => {
  const bodyScanClient = new BodyScanClient(null) as jest.Mocked<BodyScanClient>
  const hmppsAuthClient = createMockHmppsAuthClient()
  let service: BodyScanService

  const bodyScanClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    bodyScanClientFactory.mockReturnValue(bodyScanClient)
    service = new BodyScanService(hmppsAuthClient, bodyScanClientFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  describe('get prisoner details', () => {
    it('calls upstream service with correct args', async () => {
      const prisonNumber = 'A1234BC'

      await service.getPrisonerDetails(prisonNumber)

      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalled()
      expect(bodyScanClientFactory).toHaveBeenCalledWith(token)
      expect(bodyScanClient.getPrisonerDetails).toHaveBeenCalledWith(prisonNumber)
    })
  })

  describe('add body scan', () => {
    it('calls upstream service with correct args', async () => {
      const prisonNumber = 'A1234BC'
      const bodyScan: BodyScan = { date: '2020-02-20', reason: 'INTELLIGENCE', result: 'POSITIVE' }

      await service.addBodyScan('user-1', prisonNumber, bodyScan)

      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalledWith('user-1')
      expect(bodyScanClientFactory).toHaveBeenCalledWith(token)
      expect(bodyScanClient.addBodyScan).toHaveBeenCalledWith(prisonNumber, bodyScan)
    })
  })

  describe('Retrieve body scan data', () => {
    it('calls upstream service with correct args', async () => {
      const prisonNumber = 'A1234BC'

      await service.retrieveBodyScanInfo(prisonNumber)

      expect(hmppsAuthClient.getSystemClientToken).toHaveBeenCalled()
      expect(bodyScanClientFactory).toHaveBeenCalledWith(token)
      expect(bodyScanClient.getSingleBodyScanInfo).toHaveBeenCalledWith(prisonNumber)
    })
  })
})
