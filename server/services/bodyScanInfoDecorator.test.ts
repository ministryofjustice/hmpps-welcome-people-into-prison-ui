import { createMockBodyScanClient, createMockHmppsAuthClient, createMockXrayBodyScansApiClient } from '../data/__testutils/mocks'
import { createPrisonerDetails } from '../data/__testutils/testObjects'
import { BodyScanInfoDecorator } from './bodyScanInfoDecorator'
import type { AlertResponse, LatestScan } from '../data/xrayBodyScansApiClient'
import config from '../config'

jest.mock('./raiseAnalyticsEvent')

const token = 'some token'
const ENABLED_PRISON = 'MDI'
const DISABLED_PRISON = 'KMI'

describe('BodyScanInfoDecorater', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const bodyScanClient = createMockBodyScanClient()
  const xrayBodyScansApiClient = createMockXrayBodyScansApiClient()
  let service: BodyScanInfoDecorator

  const bodyScanClientFactory = jest.fn()
  const xrayBodyScansApiClientFactory = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    bodyScanClientFactory.mockReturnValue(bodyScanClient)
    xrayBodyScansApiClientFactory.mockReturnValue(xrayBodyScansApiClient)
    service = new BodyScanInfoDecorator(hmppsAuthClient, bodyScanClientFactory, xrayBodyScansApiClientFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
    config.featureToggles.newXRayBodyScansEnabledFrom = '2000-01-01T00:00:00'
    config.featureToggles.newXRayBodyScansEnabledPrisons = [ENABLED_PRISON]
  })

  afterEach(() => {
    config.featureToggles.newXRayBodyScansEnabledFrom = '2099-01-01T00:00:00'
    config.featureToggles.newXRayBodyScansEnabledPrisons = []
  })

  describe('decorate', () => {
    const arrivals = [
      { prisonNumber: 'A1234AA' },
      { prisonNumber: 'A1234AB' },
      { prisonNumber: 'A1234AC' },
      { prisonNumber: 'A1234AD' },
    ]

    describe('when feature is disabled (old bodyScan client)', () => {
      beforeEach(() => {
        bodyScanClient.getBodyScanInfo.mockResolvedValue([
          { prisonNumber: 'A1234AA', bodyScanStatus: 'OK_TO_SCAN', numberOfBodyScans: 10, numberOfBodyScansRemaining: 106 },
          { prisonNumber: 'A1234AB', bodyScanStatus: 'DO_NOT_SCAN', numberOfBodyScans: 120, numberOfBodyScansRemaining: 0 },
          { prisonNumber: 'A1234AC', bodyScanStatus: 'CLOSE_TO_LIMIT', numberOfBodyScans: 112, numberOfBodyScansRemaining: 4 },
        ])
      })

      test('happy path', async () => {
        const result = await service.decorate(arrivals, DISABLED_PRISON)

        expect(result).toStrictEqual([
          { bodyScanStatus: 'OK_TO_SCAN', prisonNumber: 'A1234AA', relevantAlerts: [], latestScan: null, nomisCount: 0 },
          { bodyScanStatus: 'DO_NOT_SCAN', prisonNumber: 'A1234AB', relevantAlerts: [], latestScan: null, nomisCount: 0 },
          { bodyScanStatus: 'CLOSE_TO_LIMIT', prisonNumber: 'A1234AC', relevantAlerts: [], latestScan: null, nomisCount: 0 },
          { bodyScanStatus: undefined, prisonNumber: 'A1234AD', relevantAlerts: [], latestScan: null, nomisCount: 0 },
        ])
        expect(bodyScanClient.getBodyScanInfo).toHaveBeenCalledWith(['A1234AA', 'A1234AB', 'A1234AC', 'A1234AD'])
        expect(xrayBodyScansApiClient.getBulkScanSummary).not.toHaveBeenCalled()
      })
    })

    describe('when feature is enabled (XRBS client)', () => {
      beforeEach(() => {
        const baseSummary = { dpsCount: 0, positiveCount: 0, negativeCount: 0, inconclusiveCount: 0, annualLimit: 116, fromScanDate: '2026-01-01', toScanDate: '2026-12-31', relevantAlerts: [] as AlertResponse[], latestScan: null as LatestScan | null }
        xrayBodyScansApiClient.getBulkScanSummary.mockResolvedValue([
          { ...baseSummary, prisonerNumber: 'A1234AA', atScanLimit: false, nearingScanLimit: false, totalCount: 10, remainingScans: 106, nomisCount: 0 },
          { ...baseSummary, prisonerNumber: 'A1234AB', atScanLimit: true, nearingScanLimit: false, totalCount: 120, remainingScans: 0, nomisCount: 0 },
          { ...baseSummary, prisonerNumber: 'A1234AC', atScanLimit: false, nearingScanLimit: true, totalCount: 112, remainingScans: 4, nomisCount: 0 },
        ])
      })

      test('happy path', async () => {
        const result = await service.decorate(arrivals, ENABLED_PRISON)

        expect(result).toStrictEqual([
          { bodyScanStatus: 'OK_TO_SCAN', prisonNumber: 'A1234AA', relevantAlerts: [], latestScan: null, nomisCount: 0 },
          { bodyScanStatus: 'DO_NOT_SCAN', prisonNumber: 'A1234AB', relevantAlerts: [], latestScan: null, nomisCount: 0 },
          { bodyScanStatus: 'CLOSE_TO_LIMIT', prisonNumber: 'A1234AC', relevantAlerts: [], latestScan: null, nomisCount: 0 },
          { bodyScanStatus: undefined, prisonNumber: 'A1234AD', relevantAlerts: [], latestScan: null, nomisCount: 0 },
        ])
        expect(xrayBodyScansApiClient.getBulkScanSummary).toHaveBeenCalledWith(['A1234AA', 'A1234AB', 'A1234AC', 'A1234AD'])
        expect(bodyScanClient.getBodyScanInfo).not.toHaveBeenCalled()
      })
    })
  })

  describe('decorateSingle', () => {
    describe('when feature is disabled (old bodyScan client)', () => {
      test('decorates using old bodyScan client', async () => {
        bodyScanClient.getSingleBodyScanInfo.mockResolvedValue({
          prisonNumber: 'A1234AB',
          bodyScanStatus: 'OK_TO_SCAN',
          numberOfBodyScans: 10,
          numberOfBodyScansRemaining: 106,
        })

        const result = await service.decorateSingle(createPrisonerDetails(), DISABLED_PRISON)

        expect(result).toStrictEqual({
          numberOfBodyScans: 10,
          numberOfBodyScansRemaining: 106,
          nomisCount: 0,
          bodyScanStatus: 'OK_TO_SCAN',
          relevantAlerts: [],
          latestScan: null,
          firstName: 'Jim',
          lastName: 'Smith',
          dateOfBirth: '1973-01-08',
          prisonNumber: 'A1234AB',
          pncNumber: '01/98644M',
          sex: 'MALE',
          arrivalType: 'NEW_BOOKING',
          arrivalTypeDescription: 'description',
        })
        expect(bodyScanClient.getSingleBodyScanInfo).toHaveBeenCalledWith('A1234AB')
        expect(xrayBodyScansApiClient.getScanSummary).not.toHaveBeenCalled()
      })
    })

    describe('when feature is enabled (XRBS client)', () => {
      test('decorates using XRBS client', async () => {
        xrayBodyScansApiClient.getScanSummary.mockResolvedValue({
          prisonerNumber: 'A1234AB',
          totalCount: 10,
          remainingScans: 106,
          nomisCount: 0,
          dpsCount: 0,
          positiveCount: 0,
          negativeCount: 0,
          inconclusiveCount: 0,
          annualLimit: 116,
          atScanLimit: false,
          nearingScanLimit: false,
          fromScanDate: '2026-01-01',
          toScanDate: '2026-12-31',
          relevantAlerts: [],
          latestScan: null,
        })

        const result = await service.decorateSingle(createPrisonerDetails(), ENABLED_PRISON)

        expect(result).toStrictEqual({
          numberOfBodyScans: 10,
          numberOfBodyScansRemaining: 106,
          nomisCount: 0,
          bodyScanStatus: 'OK_TO_SCAN',
          relevantAlerts: [],
          latestScan: null,
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
        expect(bodyScanClient.getSingleBodyScanInfo).not.toHaveBeenCalled()
      })
    })
  })
})
