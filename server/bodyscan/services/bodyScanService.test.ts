// eslint-disable-next-line import/no-unresolved
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

      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(bodyScanClientFactory).toBeCalledWith(token)
      expect(bodyScanClient.getPrisonerDetails).toBeCalledWith(prisonNumber)
    })
  })

  describe('add body scan', () => {
    it('calls upstream service with correct args', async () => {
      const prisonNumber = 'A1234BC'
      const bodyScan: BodyScan = { date: '2020-02-20', reason: 'INTELLIGENCE', result: 'POSITIVE' }

      await service.addBodyScan('user-1', prisonNumber, bodyScan)

      expect(hmppsAuthClient.getSystemClientToken).toBeCalledWith('user-1')
      expect(bodyScanClientFactory).toBeCalledWith(token)
      expect(bodyScanClient.addBodyScan).toBeCalledWith(prisonNumber, bodyScan)
    })
  })

  describe('Retrieve body scan data', () => {
    it('calls upstream service with correct args', async () => {
      const prisonNumber = 'A1234BC'

      await service.retrieveBodyScanInfo(prisonNumber)

      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(bodyScanClientFactory).toBeCalledWith(token)
      expect(bodyScanClient.getSingleBodyScanInfo).toBeCalledWith(prisonNumber)
    })
  })
})
