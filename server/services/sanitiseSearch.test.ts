import sanitiseSearchCriteria from './sanitiseSearch'

describe('Sanitise for search', () => {
  test('Empty search', () => {
    expect(sanitiseSearchCriteria({})).toStrictEqual({})
  })

  test('Prison number only search', () => {
    expect(sanitiseSearchCriteria({ prisonNumber: 'A1234AA' })).toStrictEqual({ prisonNumber: 'A1234AA' })
  })

  test('PNC number only search', () => {
    expect(sanitiseSearchCriteria({ pncNumber: '01/12345A' })).toStrictEqual({ pncNumber: '01/12345A' })
  })

  test('First name only search', () => {
    expect(sanitiseSearchCriteria({ firstName: 'bob' })).toStrictEqual({ firstName: 'Bob' })
  })

  test('Last name only search', () => {
    expect(sanitiseSearchCriteria({ lastName: 'smith' })).toStrictEqual({ lastName: 'Smith' })
  })

  test('day only search', () => {
    expect(sanitiseSearchCriteria({ day: '1' })).toStrictEqual({})
  })

  test('month only search', () => {
    expect(sanitiseSearchCriteria({ month: '1' })).toStrictEqual({})
  })

  test('year only search', () => {
    expect(sanitiseSearchCriteria({ year: '2020' })).toStrictEqual({})
  })

  test('day and year only search', () => {
    expect(sanitiseSearchCriteria({ day: '1', year: '2020' })).toStrictEqual({})
  })

  test('month and year only search', () => {
    expect(sanitiseSearchCriteria({ month: '1', year: '2020' })).toStrictEqual({})
  })

  test('day, month and year search', () => {
    expect(sanitiseSearchCriteria({ day: '3', month: '2', year: '2020' })).toStrictEqual({ dateOfBirth: '2020-02-03' })
  })

  test('full search', () => {
    expect(
      sanitiseSearchCriteria({
        prisonNumber: 'A1234AA',
        pncNumber: '01/12345A',
        firstName: 'Bob',
        lastName: 'smith',
        day: '3',
        month: '2',
        year: '2020',
      }),
    ).toStrictEqual({
      firstName: 'Bob',
      lastName: 'Smith',
      pncNumber: '01/12345A',
      prisonNumber: 'A1234AA',
      dateOfBirth: '2020-02-03',
    })
  })

  test('unexpected fields', () => {
    expect(sanitiseSearchCriteria({ weather: 'cold' })).toStrictEqual({})
  })
})
