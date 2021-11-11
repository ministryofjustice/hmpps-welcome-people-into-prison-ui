import validation from './movementReasonsValidation'
import ImprisonmentStatusesService from '../../services/imprisonmentStatusesService'

jest.mock('../../services/imprisonmentStatusesService')

const imprisonmentStatusesService = new ImprisonmentStatusesService(
  null,
  null
) as jest.Mocked<ImprisonmentStatusesService>

describe('Movement reasons validation middleware', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    imprisonmentStatusesService.getImprisonmentStatus.mockResolvedValue({
      code: 'transfer',
      description: 'Transfer from another establishment',
      imprisonmentStatusCode: 'SENT',
      secondLevelTitle: 'Where is the prisoner being transferred from?',
      secondLevelValidationMessage: 'Select the type of transfer',
      movementReasons: [
        {
          description: 'Another establishment',
          movementReasonCode: 'INT',
        },
        {
          description: 'A foreign establishment',
          movementReasonCode: 'T',
        },
      ],
    })
  })

  it('should return an error when a movementReason is not selected', async () => {
    const result = await validation(imprisonmentStatusesService)({ imprisonmentStatus: 'transfer' })
    expect(result).toEqual([{ text: 'Select the type of transfer', href: '#movement-reason-0' }])
  })

  it('should not return an error when a movementReason is selected ', async () => {
    const result = await validation(imprisonmentStatusesService)({
      movementReason: 'INT',
      imprisonmentStatus: 'transfer',
    })
    expect(result).toEqual([])
  })
})
