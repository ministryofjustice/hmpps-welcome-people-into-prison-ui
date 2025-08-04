import PrisonNumberValidation from './prisonNumberValidation'

describe('PrisonNumberValidation', () => {
  it('Prison number optional', () => expect(PrisonNumberValidation({})).toEqual([]))

  it('valid prison number', () => expect(PrisonNumberValidation({ prisonNumber: 'A1234AA' })).toEqual([]))

  it('valid prison number is case insensitive', () =>
    expect(PrisonNumberValidation({ prisonNumber: 'A1234Aa' })).toEqual([]))

  test.each([['a'], ['1233AA'], ['A'], ['1'], ['A1234AA '], [' A1234AA'], ['A.234AA']])(
    'invalid prison numbers : (%s)',
    prisonNumber => {
      expect(PrisonNumberValidation({ prisonNumber })).toEqual([
        {
          href: '#prison-number',
          text: 'Enter a prison number in the correct format',
        },
      ])
    },
  )
})
