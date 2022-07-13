import moment from 'moment'
import validation from './bodyScanValidation'

describe('Body scan validation middleware', () => {
  const tomorrowDate = moment().add(1, 'days')
  const tomorrowDay = tomorrowDate.format('DD')
  const tomorrowMonth = tomorrowDate.format('MM')
  const tomorrowYear = tomorrowDate.format('YYYY')
  test.each([
    [
      {},
      [
        {
          href: '#date',
          text: 'Select a date for the body scan',
        },
      ],
    ],

    [
      { date: 'another-date', month: '1', year: '2020' },
      [
        {
          href: '#another-date-day',
          text: 'Date must include a day',
        },
      ],
    ],

    [
      { date: 'another-date', day: '1', month: '2' },
      [
        {
          href: '#another-date-year',
          text: 'Date must include a year',
        },
      ],
    ],

    [
      { date: 'another-date', day: '1', year: '2020' },
      [
        {
          href: '#another-date-month',
          text: 'Date must include a month',
        },
      ],
    ],

    [
      { date: 'another-date', day: '1' },
      [
        {
          href: '#another-date-month',
          text: 'Date must include a month and year',
        },
      ],
    ],

    [
      { date: 'another-date', month: '1' },
      [
        {
          href: '#another-date-day',
          text: 'Date must include a day and year',
        },
      ],
    ],

    [
      { date: 'another-date', year: '2020' },
      [
        {
          href: '#another-date-day',
          text: 'Date must include a day and month',
        },
      ],
    ],

    [
      { date: 'another-date', day: '01', month: '02', year: '202' },
      [
        {
          href: '#another-date',
          text: 'Year must include 4 numbers',
        },
      ],
    ],

    [
      { date: 'another-date', day: '29', month: '02', year: '1986' },
      [
        {
          href: '#another-date',
          text: 'Date must be a real date',
        },
      ],
    ],

    [
      { date: 'another-date', day: tomorrowDay, month: tomorrowMonth, year: tomorrowYear },
      [
        {
          href: '#another-date',
          text: 'Enter a date in the past',
        },
      ],
    ],

    [{ date: 'today', reason: 'intelligence' }, []],

    [{ date: 'another-date', day: '1', month: '2', year: '2020', reason: 'intelligence' }, []],

    [{ date: 'another-date', day: '01', month: '02', year: '2020', reason: 'intelligence' }, []],
  ])('invalid cases : (%s, %s)', (fields, expectedErrors) => {
    expect(validation(fields)).toEqual(expectedErrors)
  })
})
