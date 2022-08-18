import type { BodyScan, ReasonCode, ResultCode } from 'body-scan'
import moment from 'moment'
import { assertHasOptionalStringValues, createDate } from '../../utils/utils'

const REASON_CODES: ReasonCode[] = ['INTELLIGENCE', 'REASONABLE_SUSPICION']
const RESULT_CODES: ResultCode[] = ['POSITIVE', 'NEGATIVE']
const DATE_TYPES = ['today', 'another-date']
type DateType = typeof DATE_TYPES[number]

function checkIsMember<T extends string>(value: unknown, valid: T[]): asserts value is T {
  if (!valid.includes(value as T)) {
    throw new Error(`${value} is not one of ${valid}`)
  }
}

const parseBodyScan = (payload: Record<string, unknown>): BodyScan => {
  assertHasOptionalStringValues(payload, ['reason', 'result', 'day', 'month', 'year', 'userSelectedDate'])
  checkIsMember<ReasonCode>(payload.reason, REASON_CODES)
  checkIsMember<ResultCode>(payload.result, RESULT_CODES)
  checkIsMember<DateType>(payload.userSelectedDate, DATE_TYPES)

  const { reason, result, day, month, year, userSelectedDate } = payload
  return {
    reason,
    result,
    date: userSelectedDate === 'another-date' ? createDate(day, month, year) : moment().format('YYYY-MM-DD'),
  }
}

export default parseBodyScan
