import PncNumberValidation from './pncNumberValidation'

describe('PncNumberValidation', () => {
  it('PNC number optional', () => expect(PncNumberValidation({})).toEqual([]))

  it('valid short-form PNC number', () => expect(PncNumberValidation({ pncNumber: '01/23456A' })).toEqual([]))

  it('valid long-form PNC number', () => expect(PncNumberValidation({ pncNumber: '2001/23456A' })).toEqual([]))

  it('valid PNC number is case insensitive', () => expect(PncNumberValidation({ pncNumber: '01/23456a' })).toEqual([]))

  test.each([
    ['10000/12345'],
    ['01/123456A'],
    ['a'],
    ['1233AA'],
    ['A'],
    ['1'],
    ['A1234AA '],
    [' A1234AA'],
    ['A.234AA'],
    ['    '],
  ])('invalid PNC numbers : (%s)', pncNumber => {
    expect(PncNumberValidation({ pncNumber })).toEqual([
      {
        href: '#pnc-number',
        text: 'Enter a PNC number in the format 01/23456A or 2001/23456A',
      },
    ])
  })
})
