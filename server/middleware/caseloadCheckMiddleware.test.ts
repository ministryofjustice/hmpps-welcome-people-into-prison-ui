import caseloadCheck from './caseloadCheckMiddleware'
import { mockNext, mockRequest, mockResponse } from '../routes/testutils/requestTestUtils'

describe('caseloadCheck', () => {
  const req = mockRequest({})
  const res = mockResponse({})
  const next = mockNext()
  afterEach(() => {
    jest.resetAllMocks()
  })
  test('should call next', () => {
    res.locals.user = { activeCaseLoadId: 'NMI' }

    caseloadCheck('NMI,MDI,RNI')(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('should redirect to auth error page', () => {
    res.locals.user = { activeCaseLoadId: 'MDI' }

    caseloadCheck('NMI,RNI')(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/authError')
  })
})
