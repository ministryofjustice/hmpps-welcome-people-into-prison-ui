import { Request } from 'express'
import validationMiddleware from './validationMiddleware'
import type { ValidationError, Validator } from './validationMiddleware'
import { mockRequest, mockResponse, mockNext } from '../routes/testutils/requestTestUtils'

describe('Validation middleware', () => {
  let req: Request = mockRequest({})
  const res = mockResponse({})
  const next = mockNext()
  const error: ValidationError = { text: 'error message', href: 'error' }

  beforeEach(() => {
    jest.resetAllMocks()
    req = mockRequest({})
  })

  it('should add errors to request object when any are present', async () => {
    const alwaysFailsValidator: Validator = () => [error]
    await validationMiddleware(alwaysFailsValidator)(req, res, next)

    expect(req.errors).toEqual([error])
    expect(req.flash).toHaveBeenCalledWith('errors', [error])
    expect(next).toHaveBeenCalled()
  })

  it('should add errors to request object when any are present and return a promise', async () => {
    const alwaysFailsValidator: Validator = () => Promise.resolve([error])
    await validationMiddleware(alwaysFailsValidator)(req, res, next)

    expect(req.errors).toEqual([error])
    expect(req.flash).toHaveBeenCalledWith('errors', [error])
    expect(next).toHaveBeenCalled()
  })

  it.skip('should handle unexpected exceptions', async () => {
    const alwaysFailsValidator: Validator = async () => {
      throw new Error('Unexpected error')
    }
    await validationMiddleware(alwaysFailsValidator)(req, res, next)

    expect(next).toHaveBeenCalledWith(new Error('Unexpected error'))
    expect(req.flash).not.toHaveBeenCalled()
    expect(req.errors).toBeUndefined()
  })

  it('should not add any errors to request object when no errors are present', async () => {
    const neverFailsValidator: Validator = () => []
    await validationMiddleware(neverFailsValidator)(req, res, next)

    expect(req.errors).toEqual(undefined)
    expect(req.flash).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('should receive a request body', async () => {
    const mockValidator: Validator = jest.fn().mockReturnValue([])
    validationMiddleware(mockValidator)(req, res, next)

    expect(mockValidator).toHaveBeenCalledWith(req.body)
  })
})
