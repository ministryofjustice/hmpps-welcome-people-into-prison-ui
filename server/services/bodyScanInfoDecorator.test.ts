import { BodyScanStatus } from 'body-scan'
import { HmppsAuthClient, BodyScanClient } from '../data'

import { BodyScanInfoDecorator } from './bodyScanInfoDecorator'

jest.mock('../data')
jest.mock('./raiseAnalyticsEvent')

const token = 'some token'

describe('BodyScanInfoDecorater', () => {
  let bodyScanClient: jest.Mocked<BodyScanClient>
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let service: BodyScanInfoDecorator

  const BodyScanClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    bodyScanClient = new BodyScanClient(null) as jest.Mocked<BodyScanClient>
    BodyScanClientFactory.mockReturnValue(bodyScanClient)
    service = new BodyScanInfoDecorator(hmppsAuthClient, BodyScanClientFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  describe('getExpectedArrivals', () => {
    const arrivals = [
      { prisonNumber: 'A1234AA' },
      { prisonNumber: 'A1234AB' },
      { prisonNumber: 'A1234AC' },
      { prisonNumber: 'A1234AD' },
    ]

    beforeEach(() => {
      bodyScanClient.getBodyScanInfo.mockResolvedValue([
        {
          prisonNumber: 'A1234AA',
          bodyScanStatus: BodyScanStatus.OK_TO_SCAN,
          numberOfBodyScans: 10,
        },
        {
          prisonNumber: 'A1234AB',
          bodyScanStatus: BodyScanStatus.DO_NOT_SCAN,
          numberOfBodyScans: 120,
        },
        {
          prisonNumber: 'A1234AC',
          bodyScanStatus: BodyScanStatus.CLOSE_TO_LIMIT,
          numberOfBodyScans: 112,
        },
      ])
    })

    test('happy path', async () => {
      const result = await service.decorate(arrivals)

      expect(result).toStrictEqual([
        { bodyScanStatus: 'OK_TO_SCAN', prisonNumber: 'A1234AA' },
        { bodyScanStatus: 'DO_NOT_SCAN', prisonNumber: 'A1234AB' },
        { bodyScanStatus: 'CLOSE_TO_LIMIT', prisonNumber: 'A1234AC' },
        { bodyScanStatus: undefined, prisonNumber: 'A1234AD' },
      ])
    })
  })
})
