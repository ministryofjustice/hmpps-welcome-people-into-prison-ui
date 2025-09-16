import moment from 'moment'
import {
  assertHasOptionalStringValues,
  assertHasStringValues,
  associateBy,
  calculateAge,
  generateCurrentYear,
  compareByDescendingDateAndTime,
  compareByFullName,
  convertToTitleCase,
  createDate,
  groupBy,
  isFutureDate,
  isPastDate,
  isValidDate,
  trimObjectValues,
  zip,
} from './utils'

describe('Convert to title case', () => {
  it('null string', () => {
    expect(convertToTitleCase(null)).toEqual('')
  })
  it('empty string', () => {
    expect(convertToTitleCase('')).toEqual('')
  })
  it('Lower Case', () => {
    expect(convertToTitleCase('robert')).toEqual('Robert')
  })
  it('Upper Case', () => {
    expect(convertToTitleCase('ROBERT')).toEqual('Robert')
  })
  it('Mixed Case', () => {
    expect(convertToTitleCase('RoBErT')).toEqual('Robert')
  })
  it('Multiple words', () => {
    expect(convertToTitleCase('RobeRT SMiTH')).toEqual('Robert Smith')
  })
  it('Leading spaces', () => {
    expect(convertToTitleCase('  RobeRT')).toEqual('  Robert')
  })
  it('Trailing spaces', () => {
    expect(convertToTitleCase('RobeRT  ')).toEqual('Robert  ')
  })
  it('Hyphenated', () => {
    expect(convertToTitleCase('Robert-John SmiTH-jONes-WILSON')).toEqual('Robert-John Smith-Jones-Wilson')
  })
})

describe('trimObjectValues', () => {
  it('Should trim single value', () => {
    expect(trimObjectValues({ name: '   bob ' })).toEqual({ name: 'bob' })
  })
  it('Should trim multiple values', () => {
    expect(trimObjectValues({ firstName: '   bob ', lastName: 'Smith' })).toEqual({
      firstName: 'bob',
      lastName: 'Smith',
    })
  })

  it('Should throw if input is not an object', () => {
    expect(() => trimObjectValues(123)).toThrowError('Not a record')
  })

  it('Should throw if object contains non-strings but can handle undefined values', () => {
    expect(() => trimObjectValues({ name: 'Bob', age: 10, role: undefined })).toThrowError(
      'Values present not all strings',
    )
  })
})

describe('createDate', () => {
  test('date with padded zeros', () => {
    expect(createDate('01', '03', '2020')).toBe('2020-03-01')
  })
  test('date without zeros', () => {
    expect(createDate('1', '3', '20')).toBe('0020-03-01')
  })
})

describe('groupBy', () => {
  it('should handle empty lists', () => {
    expect(groupBy([], i => (i % 2 === 0 ? 'even' : 'odd'))).toEqual(new Map())
  })

  it('should handle null keys', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(groupBy([1, 2], () => null)).toEqual(new Map([[null, [1, 2]]]))
  })

  it('should handle lists with content', () => {
    expect(groupBy([1, 2, 3, 4, 5], i => (i % 2 === 0 ? 'even' : 'odd'))).toEqual(
      new Map(Object.entries({ odd: [1, 3, 5], even: [2, 4] })),
    )
  })
})

describe('associateBy', () => {
  it('should handle empty lists', () => {
    expect(associateBy([], i => i)).toEqual(new Map())
  })

  it('should handle lists with content', () => {
    expect(associateBy(['Aaa', 'Bbb', 'Ccc'], i => i.charAt(0))).toEqual(
      new Map(Object.entries({ A: 'Aaa', B: 'Bbb', C: 'Ccc' })),
    )
  })
})

describe('compareByFullName', () => {
  it('should compare by last name alphabetically', () => {
    expect(
      compareByFullName(
        {
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          firstName: 'Sam',
          lastName: 'Adams',
        },
      ),
    ).toEqual(1)

    expect(
      compareByFullName(
        {
          firstName: 'Sam',
          lastName: 'Adams',
        },
        {
          firstName: 'John',
          lastName: 'Doe',
        },
      ),
    ).toEqual(-1)
  })

  it('should compare alphabetically by first name when names share the same last name', () => {
    expect(
      compareByFullName(
        {
          firstName: 'Sam',
          lastName: 'Doe',
        },
        {
          firstName: 'John',
          lastName: 'Doe',
        },
      ),
    ).toEqual(1)

    expect(
      compareByFullName(
        {
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          firstName: 'Sam',
          lastName: 'Doe',
        },
      ),
    ).toEqual(-1)
  })

  it('should handle duplicate names', () => {
    expect(
      compareByFullName(
        {
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          firstName: 'John',
          lastName: 'Doe',
        },
      ),
    ).toEqual(0)
  })

  it('should handle all types containing firstName and lastName', () => {
    expect(
      compareByFullName(
        {
          firstName: 'Mark',
          lastName: 'Prisoner',
          dateOfBirth: '1985-01-05',
          prisonNumber: 'G0016GD',
          reasonForAbsence: 'Hospital appointment',
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1971-01-01',
          prisonNumber: 'G0013AB',
          reasonForAbsence: 'Hospital appointment',
        },
      ),
    ).toEqual(1)

    expect(
      compareByFullName(
        {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1971-01-01',
          prisonNumber: 'G0013AB',
          pncNumber: '01/3456A',
          date: '2021-09-01',
          fromLocation: 'Reading',
          moveType: 'PRISON_REMAND',
        },
        {
          firstName: 'Karl',
          lastName: 'Offender',
          dateOfBirth: '1985-01-01',
          prisonNumber: 'G0015GD',
          pncNumber: '01/5678A',
          date: '2021-09-01',
          fromLocation: 'Leeds',
          moveType: 'PRISON_TRANSFER',
        },
      ),
    ).toEqual(-1)
  })
})

describe('compareByDescendingDateAndTime', () => {
  it('should compare by movementDateTime sorting latest first', () => {
    expect(
      compareByDescendingDateAndTime<Record<string, string>>(a => a.movementDateTime)(
        {
          movementDateTime: '2022-05-18T13:08:00',
        },
        {
          movementDateTime: '2022-05-17T07:07:59',
        },
      ),
    ).toBeLessThan(0)

    expect(
      compareByDescendingDateAndTime<Record<string, string>>(a => a.movementDateTime)(
        {
          movementDateTime: '2022-05-17T07:07:59',
        },
        {
          movementDateTime: '2022-05-18T13:08:00',
        },
      ),
    ).toBeGreaterThan(0)
  })

  it('should handle duplicate movementDateTimes', () => {
    expect(
      compareByDescendingDateAndTime<Record<string, string>>(a => a.movementDateTime)(
        {
          movementDateTime: '2022-05-18T14:13:27',
        },
        {
          movementDateTime: '2022-05-18T14:13:27',
        },
      ),
    ).toEqual(0)
  })
})

describe('assertHasStringValues', () => {
  it('Has required fields', () => {
    const record: Record<string, unknown> = { name: 'Jo', role: 'dev' }

    assertHasStringValues(record, ['name', 'role'])

    expect(record.name).toEqual('Jo')
  })

  it('Has more than required fields', () => {
    const record: Record<string, unknown> = { name: 'Jo', role: 'dev' }

    assertHasStringValues(record, ['name'])

    expect(record.name).toEqual('Jo')
  })

  it('Has less than required fields', () => {
    const record: Record<string, unknown> = { name: 'Jo' }

    expect(() => assertHasStringValues(record, ['name', 'role'])).toThrowError('Missing or invalid keys: role')
  })

  it('Has no required fields', () => {
    const record: Record<string, unknown> = {}

    expect(() => assertHasStringValues(record, ['name', 'role'])).toThrowError('Missing or invalid keys: name,role')
  })

  it('Is null', () => {
    const record: Record<string, unknown> = null

    expect(() => assertHasStringValues(record, ['name', 'role'])).toThrowError('Not a record')
  })

  it('Has empty fields', () => {
    const record: Record<string, unknown> = { name: '', role: '' }

    assertHasStringValues(record, ['name', 'role'])

    expect(record.name).toEqual('')
  })

  it('Has non-string fields', () => {
    const record: Record<string, unknown> = { name: 1, role: true }

    expect(() => assertHasStringValues(record, ['name', 'role'])).toThrowError('Missing or invalid keys: name,role')
  })

  it('Has null fields', () => {
    const record: Record<string, unknown> = { name: null, role: 'true' }

    expect(() => assertHasStringValues(record, ['name', 'role'])).toThrowError('Missing or invalid keys: name')
  })

  it('Has undefined fields', () => {
    const record: Record<string, unknown> = { name: undefined, role: 'true' }

    expect(() => assertHasStringValues(record, ['name', 'role'])).toThrowError('Missing or invalid keys: name')
  })
})

describe('assertHasOptionalStringValues', () => {
  it('Has required fields', () => {
    const record: Record<string, unknown> = { name: 'Jo', role: 'dev' }

    assertHasOptionalStringValues(record, ['name', 'role'])

    expect(record.name).toEqual('Jo')
  })

  it('Has more than required fields', () => {
    const record: Record<string, unknown> = { name: 'Jo', role: 'dev' }

    assertHasOptionalStringValues(record, ['name'])

    expect(record.name).toEqual('Jo')
  })

  it('Has less than required fields', () => {
    const record: Record<string, unknown> = { name: 'Jo' }

    assertHasOptionalStringValues(record, ['name', 'role'])
  })

  it('Has no required fields', () => {
    const record: Record<string, unknown> = {}

    assertHasOptionalStringValues(record, ['name', 'role'])
  })

  it('Has empty fields', () => {
    const record: Record<string, unknown> = { name: '', role: '' }

    assertHasOptionalStringValues(record, ['name', 'role'])

    expect(record.name).toEqual('')
  })

  it('Has non-string fields', () => {
    const record: Record<string, unknown> = { name: 1, role: true }

    expect(() => assertHasOptionalStringValues(record, ['name', 'role'])).toThrowError('Non string keys: name,role')
  })

  it('is null', () => {
    const record: Record<string, unknown> = null

    expect(() => assertHasOptionalStringValues(record, ['name', 'role'])).toThrowError('Not a record')
  })
})

describe('zip', () => {
  it('empty arrays', () => {
    expect(zip([], [])).toEqual([])
  })

  it('equal length', () => {
    expect(zip(['aaa', 'bbb'], [1, 2])).toEqual([
      ['aaa', 1],
      ['bbb', 2],
    ])
  })

  it('unequal lengths, first smaller, provides a value per first array', () => {
    expect(zip(['aaa'], [1, 2])).toEqual([['aaa', 1]])
  })

  it('unequal lengths, second smaller, fills in second value with undefined ', () => {
    expect(zip(['aaa', 'bbb'], [1])).toEqual([
      ['aaa', 1],
      ['bbb', undefined],
    ])
  })
})

describe('isValidDate', () => {
  it('has invalid month', () => {
    const result = isValidDate('01', '42', '2000')
    expect(result).toEqual(false)
  })

  it('has no day month or year', () => {
    const result = isValidDate(undefined, undefined, undefined)
    expect(result).toEqual(true)
  })

  it('has valid date', () => {
    const result = isValidDate('01', '05', '2000')
    expect(result).toEqual(true)
  })
})

describe('isPastDate', () => {
  it('handles future date', () => {
    const tomorrow = moment().add(1, 'days')
    const day = tomorrow.format('DD')
    const month = tomorrow.format('MM')
    const year = tomorrow.format('YYYY')
    const result = isPastDate(day, month, year)
    expect(result).toEqual(false)
  })

  it('handles todays date', () => {
    const today = moment()
    const day = today.format('DD')
    const month = today.format('MM')
    const year = today.format('YYYY')
    const result = isPastDate(day, month, year)
    expect(result).toEqual(false)
  })

  it('handles past date', () => {
    const yesterday = moment().subtract(1, 'days')
    const day = yesterday.format('DD')
    const month = yesterday.format('MM')
    const year = yesterday.format('YYYY')
    const result = isPastDate(day, month, year)
    expect(result).toEqual(true)
  })
})

describe('isFutureDate', () => {
  it('handles future date', () => {
    const tomorrow = moment().add(1, 'days')
    const day = tomorrow.format('DD')
    const month = tomorrow.format('MM')
    const year = tomorrow.format('YYYY')
    const result = isFutureDate(day, month, year)
    expect(result).toEqual(true)
  })

  it('handles todays date', () => {
    const today = moment()
    const day = today.format('DD')
    const month = today.format('MM')
    const year = today.format('YYYY')
    const result = isFutureDate(day, month, year)
    expect(result).toEqual(false)
  })

  it('handles past date', () => {
    const yesterday = moment().subtract(1, 'days')
    const day = yesterday.format('DD')
    const month = yesterday.format('MM')
    const year = yesterday.format('YYYY')
    const result = isFutureDate(day, month, year)
    expect(result).toEqual(false)
  })
})

describe('calculateAge', () => {
  it('returns correct age if birthday is today', () => {
    const twentyYearsAgo = moment().subtract(20, 'years').format('YYYY-MM-DD')
    expect(calculateAge(twentyYearsAgo)).toBe(20)
  })

  it('returns correct age when birthday has occurred this year', () => {
    const twentyYearsAgo = moment().subtract(20, 'years').subtract(1, 'day').format('YYYY-MM-DD')
    expect(calculateAge(twentyYearsAgo)).toBe(20)
  })

  it('returns correct age when birthday has not occurred this year', () => {
    const twentyYearsAgo = moment().subtract(20, 'years').add(1, 'day').format('YYYY-MM-DD')
    expect(calculateAge(twentyYearsAgo)).toBe(19)
  })
})

describe('generateCurrentYear', () => {
  it('returns current year of now', () => {
    expect(generateCurrentYear(() => moment('2023-02-03 13:00:00'))).toBe(2023)
  })

  it('returns current year when now is the very start of the year', () => {
    expect(generateCurrentYear(() => moment('2023-01-01 00:00:00'))).toBe(2023)
  })

  it('returns current year when now is the very end of the year', () => {
    expect(generateCurrentYear(() => moment('2023-12-31 23:59:59'))).toBe(2023)
  })
})
