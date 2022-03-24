import DateOfBirthValidator from './dateOfBirthValidation'

describe('DateOfBirthValidator', () => {
  test.each([
    [
      { month: '1', year: '2020' },
      [
        {
          href: '#date-of-birth-day',
          text: 'Date of birth must include a day',
        },
      ],
    ],

    [
      { day: '1', month: '2' },
      [
        {
          href: '#date-of-birth-year',
          text: 'Date of birth must include a year',
        },
      ],
    ],

    [
      { day: '1', year: '2020' },
      [
        {
          href: '#date-of-birth-month',
          text: 'Date of birth must include a month',
        },
      ],
    ],

    [
      { day: '1' },
      [
        {
          href: '#date-of-birth-month',
          text: 'Date of birth must include a month and year',
        },
      ],
    ],

    [
      { month: '1' },
      [
        {
          href: '#date-of-birth-day',
          text: 'Date of birth must include a day and year',
        },
      ],
    ],

    [
      { year: '2020' },
      [
        {
          href: '#date-of-birth-day',
          text: 'Date of birth must include a day and month',
        },
      ],
    ],

    [{ day: '1', month: '2', year: '2020' }, []],

    [{ day: '01', month: '02', year: '2020' }, []],
  ])('invalid cases : (%s, %s)', (fields, expectedErrors) => {
    expect(DateOfBirthValidator(fields)).toEqual(expectedErrors)
  })
})
