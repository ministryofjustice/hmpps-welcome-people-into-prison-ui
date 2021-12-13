import redirectIfDisabledMiddleware from './redirectIfDisabledMiddleware'
import { mockNext, mockRequest, mockResponse } from '../routes/testutils/requestTestUtils'

describe('redirectIfDisabledMiddleware', () => {
  const req = mockRequest({})
  const res = mockResponse({})
  const next = mockNext()

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('should call next', () => {
    res.locals.user = { activeCaseLoadId: 'NMI' }

    redirectIfDisabledMiddleware(true)(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('should redirect to feature not available page', () => {
    res.locals.user = { activeCaseLoadId: 'MDI' }

    redirectIfDisabledMiddleware(false)(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/feature-not-available')
  })
})
