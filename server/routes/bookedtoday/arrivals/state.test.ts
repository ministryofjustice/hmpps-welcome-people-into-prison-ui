import { mockNext, mockRequest, mockResponse } from '../../__testutils/requestTestUtils'
import { State } from './state'

describe('StatusAndReasonsCodec', () => {
  test('read', () => {
    const result = State.imprisonmentStatus.read({
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
    const result = State.imprisonmentStatus.write({
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

    State.imprisonmentStatus.ensurePresent('/redirect')(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  test('when empty', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = { 'offender-booking-creation': '' }

    State.imprisonmentStatus.ensurePresent('/redirect')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect')
    expect(next).not.toHaveBeenCalled()
  })

  test('when absent', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = {}

    State.imprisonmentStatus.ensurePresent('/redirect')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect')
    expect(next).not.toHaveBeenCalled()
  })
})

describe('SexCodec', () => {
  test('read', () => {
    const result = State.sex.read({ data: 'M' })

    expect(result).toStrictEqual('M')
  })

  test('write', () => {
    const result = State.sex.write('M')

    expect(result).toStrictEqual({ data: 'M' })
  })
})

describe('ensureSexPresentMiddleware', () => {
  test('when present', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = { sex: 'some content' }

    State.sex.ensurePresent('/redirect')(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  test('when empty', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = { data: '' }

    State.sex.ensurePresent('/redirect')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect')
    expect(next).not.toHaveBeenCalled()
  })

  test('when absent', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = {}

    State.sex.ensurePresent('/redirect')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect')
    expect(next).not.toHaveBeenCalled()
  })
})
