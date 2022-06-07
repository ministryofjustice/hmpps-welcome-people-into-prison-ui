import { mockNext, mockRequest, mockResponse } from '../__testutils/requestTestUtils'
import { State } from './state'

describe('SearchQueryCodec', () => {
  test('read', () => {
    const result = State.searchQuery.read({
      searchQuery: 'Smith',
    })

    expect(result).toStrictEqual({
      searchQuery: 'Smith',
    })
  })

  test('write', () => {
    const result = State.searchQuery.write({
      searchQuery: 'Smith',
    })

    expect(result).toStrictEqual({
      searchQuery: 'Smith',
    })
  })
})

describe('ensureSearchQueryPresentMiddleware', () => {
  test('when present', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = { 'search-query': 'some content' }

    State.searchQuery.ensurePresent('/redirect')(req, res, next)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  test('when empty', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = { 'search-query': '' }

    State.searchQuery.ensurePresent('/redirect')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect')
    expect(next).not.toHaveBeenCalled()
  })

  test('when absent', () => {
    const req = mockRequest({})
    const res = mockResponse({})
    const next = mockNext()

    req.signedCookies = {}

    State.searchQuery.ensurePresent('/redirect')(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith('/redirect')
    expect(next).not.toHaveBeenCalled()
  })
})
