import { convertToTitleCase, groupBy, compareByFullName, assertHasStringValues } from './utils'

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

describe('groupBy', () => {
  it('should handle empty lists', () => {
    expect(groupBy([], i => (i % 2 === 0 ? 'even' : 'odd'))).toEqual(new Map())
  })

  it('should handle null keys', () => {
    expect(groupBy([1, 2], _ => null)).toEqual(new Map([[null, [1, 2]]]))
  })

  it('should handle lists with content', () => {
    expect(groupBy([1, 2, 3, 4, 5], i => (i % 2 === 0 ? 'even' : 'odd'))).toEqual(
      new Map(Object.entries({ odd: [1, 3, 5], even: [2, 4] }))
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
        }
      )
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
        }
      )
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
        }
      )
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
        }
      )
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
        }
      )
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
        }
      )
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
        }
      )
    ).toEqual(-1)
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
