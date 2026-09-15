import { createMockXrayBodyScansApiClient, createMockHmppsAuthClient } from '../data/__testutils/mocks'
import { createPrisonerDetails } from '../data/__testutils/testObjects'
import { BodyScanInfoDecorator } from './bodyScanInfoDecorator'
import type { ScanSummaryResponse } from '../data/xrayBodyScansApiClient'

jest.mock('./raiseAnalyticsEvent')

const token = 'some token'

const scanSummary = (
  prisonerNumber: string,
  overrides: Partial<ScanSummaryResponse> = {},
): ScanSummaryResponse => ({
  prisonerNumber,
  nomisCount: 0,
  dpsCount: 0,
  totalCount: 0,
  positiveCount: 0,
  negativeCount: 0,
  inconclusiveCount: 0,
  annualLimit: 116,
  remainingScans: 116,
  nearingScanLimit: false,
  atScanLimit: false,
  fromScanDate: '2026-01-01',
  toScanDate: '2026-09-15',
  ...overrides,
})

describe('BodyScanInfoDecorater', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const xrayBodyScansApiClient = createMockXrayBodyScansApiClient()
  let service: BodyScanInfoDecorator

  const xrayBodyScansApiClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    xrayBodyScansApiClientFactory.mockReturnValue(xrayBodyScansApiClient)
    service = new BodyScanInfoDecorator(hmppsAuthClient, xrayBodyScansApiClientFactory)
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
      xrayBodyScansApiClient.getBulkScanSummary.mockResolvedValue([
        scanSummary('A1234AA'),
        scanSummary('A1234AB', { atScanLimit: true }),
        scanSummary('A1234AC', { nearingScanLimit: true }),
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

      expect(xrayBodyScansApiClient.getBulkScanSummary).toHaveBeenCalledWith(['A1234AA', 'A1234AB', 'A1234AC', 'A1234AD'])
    })

    test('does not request body scans for things without prison numbers', async () => {
      xrayBodyScansApiClient.getBulkScanSummary.mockResolvedValue([
        scanSummary('A1234AA'),
        scanSummary('A1234AC', { nearingScanLimit: true }),
      ])

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

      expect(xrayBodyScansApiClient.getBulkScanSummary).toHaveBeenCalledWith(['A1234AA', 'A1234AC'])
    })
  })

  describe('decorateSingle', () => {
    test('decorate body scan info for single prisoner', async () => {
      xrayBodyScansApiClient.getScanSummary.mockResolvedValue(
        scanSummary('A1234AB', { totalCount: 10, remainingScans: 106 }),
      )

      const result = await service.decorateSingle(createPrisonerDetails())

      expect(result).toStrictEqual({
        numberOfBodyScans: 10,
        numberOfBodyScansRemaining: 106,
        bodyScanStatus: 'OK_TO_SCAN',
        firstName: 'Jim',
        lastName: 'Smith',
        dateOfBirth: '1973-01-08',
        prisonNumber: 'A1234AB',
        pncNumber: '01/98644M',
        sex: 'MALE',
        arrivalType: 'NEW_BOOKING',
        arrivalTypeDescription: 'description',
      })

      expect(xrayBodyScansApiClient.getScanSummary).toHaveBeenCalledWith('A1234AB')
    })
  })
})
