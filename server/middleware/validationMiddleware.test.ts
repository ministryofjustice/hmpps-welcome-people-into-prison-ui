import { Request } from 'express'
import validationMiddleware from './validationMiddleware'
import type { ValidationError, Validator } from './validationMiddleware'
import { mockRequest, mockResponse, mockNext } from '../routes/__testutils/requestTestUtils'

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
    const middleware = validationMiddleware(alwaysFailsValidator)
    await middleware(req, res, next)

    expect(req.errors).toEqual([error])
    expect(req.flash).toHaveBeenCalledWith('errors', [error])
    expect(next).toHaveBeenCalled()
  })

  it('should add errors to request object if any are present and return a promise', async () => {
    const alwaysFailsValidator: Validator = () => Promise.resolve([error])
    await validationMiddleware(alwaysFailsValidator)(req, res, next)

    expect(req.errors).toEqual([error])
    expect(req.flash).toHaveBeenCalledWith('errors', [error])
    expect(next).toHaveBeenCalled()
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
  it('should handle multiple validators', async () => {
    const firstNameValidation = { text: 'first name missing', href: 'firstName' }
    const secondNameValidation = { text: 'second name missing', href: 'secondName' }
    const firstNameValidator: Validator = () => [firstNameValidation]
    const secondNameValidator: Validator = () => [secondNameValidation]

    const middleware = validationMiddleware(firstNameValidator, secondNameValidator)
    await middleware(req, res, next)

    expect(req.errors).toEqual([firstNameValidation, secondNameValidation])
    expect(req.flash).toHaveBeenCalledWith('errors', [firstNameValidation, secondNameValidation])
    expect(next).toHaveBeenCalled()
  })
})
