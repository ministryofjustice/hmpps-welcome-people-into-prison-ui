import { BodyScan } from 'body-scan'
import { BodyScanClient } from '../data'
import BodyScanService from './bodyScanService'

jest.mock('../data')

describe('Body scan service', () => {
  const bodyScanClient = new BodyScanClient(null) as jest.Mocked<BodyScanClient>
  let service: BodyScanService

  const bodyScanClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    bodyScanClientFactory.mockReturnValue(bodyScanClient)
    service = new BodyScanService(bodyScanClient)
  })

  describe('get prisoner details', () => {
    it('calls upstream service with correct args', async () => {
      const prisonNumber = 'A1234BC'

      await service.getPrisonerDetails(prisonNumber)
      expect(bodyScanClient.getPrisonerDetails).toBeCalledWith(prisonNumber)
    })
  })

  describe('add body scan', () => {
    it('calls upstream service with correct args', async () => {
      const prisonNumber = 'A1234BC'
      const bodyScan: BodyScan = { date: '2020-02-20', reason: 'INTELLIGENCE', result: 'POSITIVE' }

      await service.addBodyScan(prisonNumber, bodyScan)

      expect(bodyScanClient.addBodyScan).toBeCalledWith(prisonNumber, bodyScan)
    })
  })

  describe('Retrieve body scan data', () => {
    it('calls upstream service with correct args', async () => {
      const prisonNumber = 'A1234BC'

      await service.retrieveBodyScanInfo(prisonNumber)

      expect(bodyScanClient.getSingleBodyScanInfo).toBeCalledWith(prisonNumber)
    })
  })
})
