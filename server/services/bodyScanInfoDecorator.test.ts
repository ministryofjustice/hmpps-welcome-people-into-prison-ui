import { createMockBodyScanClient, createMockHmppsAuthClient } from '../data/__testutils/mocks'
import { createPrisonerDetails } from '../data/__testutils/testObjects'
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
          bodyScanStatus: 'OK_TO_SCAN',
          numberOfBodyScans: 10,
          numberOfBodyScansRemaining: 106,
        },
        {
          prisonNumber: 'A1234AB',
          bodyScanStatus: 'DO_NOT_SCAN',
          numberOfBodyScans: 120,
          numberOfBodyScansRemaining: 0,
        },
        {
          prisonNumber: 'A1234AC',
          bodyScanStatus: 'CLOSE_TO_LIMIT',
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

  describe('decorateSingle', () => {
    test('decorate body scan info for single prisoner', async () => {
      bodyScanClient.getSingleBodyScanInfo.mockResolvedValue({
        prisonNumber: 'A1234AB',
        bodyScanStatus: 'OK_TO_SCAN',
        numberOfBodyScans: 10,
        numberOfBodyScansRemaining: 106,
      })

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

      expect(bodyScanClient.getSingleBodyScanInfo).toHaveBeenCalledWith('A1234AB')
    })
  })
})
