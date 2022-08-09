import { BodyScanStatus } from 'body-scan'
import { createMockBodyScanClient, createMockHmppsAuthClient } from '../data/__testutils/mocks'

import { BodyScanInfoDecorator } from './bodyScanInfoDecorator'

jest.mock('./raiseAnalyticsEvent')

const token = 'some token'

describe('BodyScanInfoDecorater', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const bodyScanClient = createMockBodyScanClient()
  let service: BodyScanInfoDecorator

  const BodyScanClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    BodyScanClientFactory.mockReturnValue(bodyScanClient)
    service = new BodyScanInfoDecorator(hmppsAuthClient, BodyScanClientFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  describe('decorate', () => {
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
          numberOfBodyScansRemaining: 106,
        },
        {
          prisonNumber: 'A1234AB',
          bodyScanStatus: BodyScanStatus.DO_NOT_SCAN,
          numberOfBodyScans: 120,
          numberOfBodyScansRemaining: 0,
        },
        {
          prisonNumber: 'A1234AC',
          bodyScanStatus: BodyScanStatus.CLOSE_TO_LIMIT,
          numberOfBodyScans: 112,
          numberOfBodyScansRemaining: 4,
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

      expect(bodyScanClient.getBodyScanInfo).toHaveBeenCalledWith(['A1234AA', 'A1234AB', 'A1234AC', 'A1234AD'])
    })

    test('does not request body scans for things without prison numbers', async () => {
      const result = await service.decorate([
        { prisonNumber: 'A1234AA' },
        { prisonNumber: undefined },
        { prisonNumber: 'A1234AC' },
        { prisonNumber: undefined },
      ])

      expect(result).toStrictEqual([
        { bodyScanStatus: 'OK_TO_SCAN', prisonNumber: 'A1234AA' },
        { bodyScanStatus: undefined, prisonNumber: undefined },
        { bodyScanStatus: 'CLOSE_TO_LIMIT', prisonNumber: 'A1234AC' },
        { bodyScanStatus: undefined, prisonNumber: undefined },
      ])

      expect(bodyScanClient.getBodyScanInfo).toHaveBeenCalledWith(['A1234AA', 'A1234AC'])
    })
  })
})
