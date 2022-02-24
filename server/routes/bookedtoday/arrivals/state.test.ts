import { mockNext, mockRequest, mockResponse } from '../../__testutils/requestTestUtils'
import { State } from './state'

describe('NewArrivalCodec', () => {
  test('read optional', () => {
    const result = State.newArrival.read({
      firstName: 'Sam',
      lastName: 'Smith',
      dateOfBirth: '1971-02-01',
      prisonNumber: 'A1234AA',
      pncNumber: '01/1234X',
      sex: 'M',
      code: 'on remand',
      imprisonmentStatus: 'RX',
      movementReasonCode: 'N',
    })

    expect(result).toStrictEqual({
      firstName: 'Sam',
      lastName: 'Smith',
      dateOfBirth: '1971-02-01',
      prisonNumber: 'A1234AA',
      pncNumber: '01/1234X',
      sex: 'M',
      code: 'on remand',
      imprisonmentStatus: 'RX',
      movementReasonCode: 'N',
    })
  })

  test('read mandatory', () => {
    const result = State.newArrival.read({
      firstName: 'Sam',
      lastName: 'Smith',
      dateOfBirth: '1971-02-01',
    })

    expect(result).toStrictEqual({
      firstName: 'Sam',
      lastName: 'Smith',
      dateOfBirth: '1971-02-01',
      prisonNumber: undefined,
      pncNumber: undefined,
      sex: undefined,
      code: undefined,
      imprisonmentStatus: undefined,
      movementReasonCode: undefined,
    })
  })

  test('write optional', () => {
    const result = State.newArrival.write({
      firstName: 'Sam',
      lastName: 'Smith',
      dateOfBirth: '1971-02-01',
      prisonNumber: 'A1234AA',
      pncNumber: '01/1234X',
      sex: 'M',
      code: 'on remand',
      imprisonmentStatus: 'RX',
      movementReasonCode: 'N',
    })

    expect(result).toStrictEqual({
      firstName: 'Sam',
      lastName: 'Smith',
      dateOfBirth: '1971-02-01',
      prisonNumber: 'A1234AA',
      pncNumber: '01/1234X',
      sex: 'M',
      code: 'on remand',
      imprisonmentStatus: 'RX',
      movementReasonCode: 'N',
    })
  })

  test('write mandatory', () => {
    const result = State.newArrival.write({
      firstName: 'Sam',
      lastName: 'Smith',
      dateOfBirth: '1971-02-01',
    })

    expect(result).toStrictEqual({
      firstName: 'Sam',
      lastName: 'Smith',
      dateOfBirth: '1971-02-01',
    })
  })
})

describe('ensureNewArrivalPresentMiddleware', () => {
  test('when present', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = { 'new-arrival': 'some content' }

    State.newArrival.ensurePresent('/redirect')(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  test('when empty', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = { 'new-arrival': '' }

    State.newArrival.ensurePresent('/redirect')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect')
    expect(next).not.toHaveBeenCalled()
  })

  test('when absent', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = {}

    State.newArrival.ensurePresent('/redirect')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect')
    expect(next).not.toHaveBeenCalled()
  })
})
