import { Request, Response } from 'express'
import validation from './movementReasonsValidation'
import ImprisonmentStatusesService from '../../services/imprisonmentStatusesService'

jest.mock('../../services/imprisonmentStatusesService')

const imprisonmentStatusesService = new ImprisonmentStatusesService(
  null,
  null
) as jest.Mocked<ImprisonmentStatusesService>

describe('Movement reasons validation middleware', () => {
  let req = {
    body: {},
    params: {},
    flash: jest.fn(),
  } as unknown as Request
  const res = {} as Response
  const next = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    imprisonmentStatusesService.getImprisonmentStatus = jest.fn().mockResolvedValue({
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
    req = {
      body: {},
      params: { imprisonmentStatus: 'transfer' },
      flash: jest.fn(),
    } as unknown as Request

    await validation(imprisonmentStatusesService)(req, res, next)

    expect(req.errors).toEqual([{ text: 'Select the type of transfer', href: '#movement-reason-1' }])
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { text: 'Select the type of transfer', href: '#movement-reason-1' },
    ])
  })

  it('should not return an error when a movementReason is selected ', async () => {
    req = {
      body: { movementReason: 'INT' },
      params: { imprisonmentStatus: 'transfer' },
    } as unknown as Request

    await validation(imprisonmentStatusesService)(req, res, next)
    expect(req.errors).toBeUndefined()
  })
})
