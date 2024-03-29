import moment from 'moment'
import parseBodyScan from './bodyScan'

describe('parseBodyScan', () => {
  describe('today', () => {
    test('success', () => {
      const scan = parseBodyScan({ userSelectedDate: 'today', reason: 'INTELLIGENCE', result: 'POSITIVE' })

      expect(scan).toStrictEqual({ date: moment().format('YYYY-MM-DD'), reason: 'INTELLIGENCE', result: 'POSITIVE' })
    })
  })

  describe('another-date', () => {
    test('success', () => {
      const scan = parseBodyScan({
        userSelectedDate: 'another-date',
        day: '12',
        month: '1',
        year: '2020',
        reason: 'INTELLIGENCE',
        result: 'POSITIVE',
      })

      expect(scan).toStrictEqual({ date: '2020-01-12', reason: 'INTELLIGENCE', result: 'POSITIVE' })
    })

    test('invalid date-type', () => {
      expect(() =>
        parseBodyScan({
          userSelectedDate: 'huh?',
          day: '12',
          month: '1',
          year: '2020',
          reason: 'INTELLIGENCE',
          result: 'POSITIVE',
        })
      ).toThrowError('huh? is not one of today,another-date')
    })

    test('invalid reason', () => {
      expect(() =>
        parseBodyScan({
          userSelectedDate: 'today',
          day: '12',
          month: '1',
          year: '2020',
          reason: 'int',
          result: 'POSITIVE',
        })
      ).toThrowError('int is not one of INTELLIGENCE,REASONABLE_SUSPICION')
    })

    test('invalid result', () => {
      expect(() =>
        parseBodyScan({
          userSelectedDate: 'today',
          day: '12',
          month: '1',
          year: '2020',
          reason: 'INTELLIGENCE',
          result: 'pos',
        })
      ).toThrowError('pos is not one of POSITIVE,NEGATIVE')
    })
  })
})
