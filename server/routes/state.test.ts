import { mockNext, mockRequest, mockResponse } from './testutils/requestTestUtils'
import { StatusAndReasonsCodec, ensureImprisonmentStatusPresentMiddleware } from './state'

describe('StatusAndReasonsCodec', () => {
  test('read', () => {
    const result = StatusAndReasonsCodec.read({
      code: 'on remand',
      imprisonmentStatus: 'RX',
      movementReasonCode: 'N',
    })

    expect(result).toStrictEqual({
      code: 'on remand',
      imprisonmentStatus: 'RX',
      movementReasonCode: 'N',
    })
  })

  test('write', () => {
    const result = StatusAndReasonsCodec.write({
      code: 'on remand',
      imprisonmentStatus: 'RX',
      movementReasonCode: 'N',
    })

    expect(result).toStrictEqual({
      code: 'on remand',
      imprisonmentStatus: 'RX',
      movementReasonCode: 'N',
    })
  })
})

describe('ensureImprisonmentStatusPresentMiddleware', () => {
  test('when present', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = { 'status-and-reason': 'some content' }

    ensureImprisonmentStatusPresentMiddleware('/redirect')(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  test('when empty', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = { 'offender-booking-creation': '' }

    ensureImprisonmentStatusPresentMiddleware('/redirect')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect')
    expect(next).not.toHaveBeenCalled()
  })

  test('when absent', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = {}

    ensureImprisonmentStatusPresentMiddleware('/redirect')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect')
    expect(next).not.toHaveBeenCalled()
  })
})
