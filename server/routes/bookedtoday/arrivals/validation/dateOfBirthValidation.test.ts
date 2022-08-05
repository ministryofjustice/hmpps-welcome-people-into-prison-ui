import moment from 'moment'
import DateOfBirthValidator from './dateOfBirthValidation'

describe('DateOfBirthValidator', () => {
  const tomorrowDate = moment().add(1, 'days')
  const tomorrowDay = tomorrowDate.format('DD')
  const tomorrowMonth = tomorrowDate.format('MM')
  const tomorrowYear = tomorrowDate.format('YYYY')
  test.each([
    [
      {},
      [
        {
          href: '#date-of-birth-day',
          text: "Enter this person's date of birth",
        },
      ],
    ],

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
      { day: '1', month: '2', year: '20' },
      [
        {
          href: '#date-of-birth-year',
          text: 'Date of birth year must be in 4 digit format',
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

    [
      { day: 'aaa', month: 'bbb', year: 'ccc' },
      [
        {
          href: '#date-of-birth-day',
          text: "Enter this person's date of birth",
        },
      ],
    ],
    [
      { day: 'aaa' },
      [
        {
          href: '#date-of-birth-day',
          text: "Enter this person's date of birth",
        },
      ],
    ],
    [
      { day: '29', month: '02', year: '1986' },
      [
        {
          href: '#date-of-birth-day',
          text: 'Date of birth must be a real date',
        },
      ],
    ],
    [{ day: '1', month: '2', year: '2020' }, []],

    [{ day: '01', month: '02', year: '2020' }, []],
    [
      { day: tomorrowDay, month: tomorrowMonth, year: tomorrowYear },
      [
        {
          href: '#date-of-birth-day',
          text: 'Date of birth must be in the past',
        },
      ],
    ],
  ])('invalid cases : (%s, %s)', (fields, expectedErrors) => {
    expect(DateOfBirthValidator(fields)).toEqual(expectedErrors)
  })
})
