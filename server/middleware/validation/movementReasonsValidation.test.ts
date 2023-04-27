import validation from './movementReasonsValidation'
import { createMockImprisonmentStatusesService } from '../../services/__testutils/mocks'

const imprisonmentStatusesService = createMockImprisonmentStatusesService()

describe('Movement reasons validation middleware', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    imprisonmentStatusesService.getImprisonmentStatus.mockResolvedValue({
      code: 'transfer',
      description: 'Transfer from a foreign establishment',
      imprisonmentStatusCode: 'SENT',
      movementReasons: [
        {
          description: 'A foreign establishment',
          movementReasonCode: 'T',
        },
      ],
    })
  })

  it('should not return an error when a movementReason is selected ', async () => {
    const result = await validation(imprisonmentStatusesService)({
      movementReason: 'INT',
      imprisonmentStatus: 'transfer',
    })
    expect(result).toEqual([])
  })
})
