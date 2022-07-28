import moment from 'moment'
import validation from './bodyScanValidation'

describe('Body scan validation middleware', () => {
  const tomorrowDate = moment().add(1, 'days')
  const tomorrowDay = tomorrowDate.format('DD')
  const tomorrowMonth = tomorrowDate.format('MM')
  const tomorrowYear = tomorrowDate.format('YYYY')

  describe('today', () => {
    const validToday = { userSelectedDate: 'today', reason: 'INTELLIGENCE', result: 'POSITIVE' }
    test.each([
      [
        {},
        [
          {
            href: '#user-selected-date',
            text: 'Select a date for the body scan',
          },
          { text: 'Select a reason for the body scan', href: '#reason' },
          {
            href: '#result',
            text: 'Select a result for the body scan',
          },
        ],
      ],

      [
        { ...validToday, reason: undefined },
        [
          {
            href: '#reason',
            text: 'Select a reason for the body scan',
          },
        ],
      ],

      [
        { ...validToday, result: undefined },
        [
          {
            href: '#result',
            text: 'Select a result for the body scan',
          },
        ],
      ],

      [validToday, []],
    ])('Cases : (%s, %s)', (fields, expectedErrors) => {
      expect(validation(fields)).toEqual(expectedErrors)
    })
  })

  describe('another-date', () => {
    const validAnotherDate = {
      userSelectedDate: 'another-date',
      day: '12',
      month: '1',
      year: '2020',
      reason: 'intelligence',
      result: 'POSITIVE',
    }
    test.each([
      [
        { ...validAnotherDate, reason: undefined },
        [
          {
            href: '#reason',
            text: 'Select a reason for the body scan',
          },
        ],
      ],

      [
        { ...validAnotherDate, result: undefined },
        [
          {
            href: '#result',
            text: 'Select a result for the body scan',
          },
        ],
      ],

      [
        { ...validAnotherDate, day: undefined },
        [
          {
            href: '#another-date-day',
            text: 'Date must include a day',
          },
        ],
      ],

      [
        { ...validAnotherDate, year: undefined },
        [
          {
            href: '#another-date-year',
            text: 'Date must include a year',
          },
        ],
      ],

      [
        { ...validAnotherDate, month: undefined },
        [
          {
            href: '#another-date-month',
            text: 'Date must include a month',
          },
        ],
      ],

      [
        { ...validAnotherDate, month: undefined, year: undefined },
        [
          {
            href: '#another-date-month',
            text: 'Date must include a month and year',
          },
        ],
      ],

      [
        { ...validAnotherDate, day: undefined, year: undefined },
        [
          {
            href: '#another-date-day',
            text: 'Date must include a day and year',
          },
        ],
      ],

      [
        { ...validAnotherDate, day: undefined, month: undefined },
        [
          {
            href: '#another-date-day',
            text: 'Date must include a day and month',
          },
        ],
      ],

      [
        { ...validAnotherDate, year: '202' },

        [
          {
            href: '#another-date',
            text: 'Year must include 4 numbers',
          },
        ],
      ],

      [
        { ...validAnotherDate, day: undefined, year: '202' },

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
        { ...validAnotherDate, day: '29', month: '02', year: '1986' },

        [
          {
            href: '#another-date',
            text: 'Date must be a real date',
          },
        ],
      ],

      [
        {
          ...validAnotherDate,
          day: tomorrowDay,
          month: tomorrowMonth,
          year: tomorrowYear,
        },
        [
          {
            href: '#another-date',
            text: 'Enter a date in the past',
          },
        ],
      ],

      [{ ...validAnotherDate }, []],
    ])('Cases : (%s, %s)', (fields, expectedErrors) => {
      expect(validation(fields)).toEqual(expectedErrors)
    })
  })
})
