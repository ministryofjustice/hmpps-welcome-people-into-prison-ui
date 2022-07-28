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
          href: '#user-selected-date',
          text: 'Select a date for the body scan',
        },
        { text: 'Select a reason for the body scan', href: '#reason' },
      ],
    ],

    [
      { userSelectedDate: 'another-date', month: '1', year: '2020', reason: 'intelligence' },
      [
        {
          href: '#another-date-day',
          text: 'Date must include a day',
        },
      ],
    ],

    [
      { userSelectedDate: 'another-date', day: '1', month: '2', reason: 'intelligence' },
      [
        {
          href: '#another-date-year',
          text: 'Date must include a year',
        },
      ],
    ],

    [
      { userSelectedDate: 'another-date', day: '1', year: '2020', reason: 'intelligence' },
      [
        {
          href: '#another-date-month',
          text: 'Date must include a month',
        },
      ],
    ],

    [
      { userSelectedDate: 'another-date', day: '1', reason: 'intelligence' },
      [
        {
          href: '#another-date-month',
          text: 'Date must include a month and year',
        },
      ],
    ],

    [
      { userSelectedDate: 'another-date', month: '1', reason: 'intelligence' },
      [
        {
          href: '#another-date-day',
          text: 'Date must include a day and year',
        },
      ],
    ],

    [
      { userSelectedDate: 'another-date', year: '2020', reason: 'intelligence' },
      [
        {
          href: '#another-date-day',
          text: 'Date must include a day and month',
        },
      ],
    ],

    [
      { userSelectedDate: 'another-date', day: '01', month: '02', year: '202', reason: 'intelligence' },
      [
        {
          href: '#another-date',
          text: 'Year must include 4 numbers',
        },
      ],
    ],

    [
      { userSelectedDate: 'another-date', month: '02', year: '202', reason: 'intelligence' },
      [
        {
          href: '#another-date-day',
          text: 'Date must include a day',
        },
        {
          href: '#another-date',
          text: 'Year must include 4 numbers',
        },
      ],
    ],

    [
      { userSelectedDate: 'another-date', day: '29', month: '02', year: '1986', reason: 'intelligence' },
      [
        {
          href: '#another-date',
          text: 'Date must be a real date',
        },
      ],
    ],

    [
      {
        userSelectedDate: 'another-date',
        day: tomorrowDay,
        month: tomorrowMonth,
        year: tomorrowYear,
        reason: 'intelligence',
      },
      [
        {
          href: '#another-date',
          text: 'Enter a date in the past',
        },
      ],
    ],

    [
      { userSelectedDate: 'today' },
      [
        {
          href: '#reason',
          text: 'Select a reason for the body scan',
        },
      ],
    ],

    [{ userSelectedDate: 'today', reason: 'intelligence' }, []],

    [{ userSelectedDate: 'another-date', day: '1', month: '2', year: '2020', reason: 'intelligence' }, []],

    [{ userSelectedDate: 'another-date', day: '01', month: '02', year: '2020', reason: 'intelligence' }, []],
  ])('invalid cases : (%s, %s)', (fields, expectedErrors) => {
    expect(validation(fields)).toEqual(expectedErrors)
  })
})
