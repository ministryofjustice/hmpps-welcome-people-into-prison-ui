import { Validator } from '../validationMiddleware'
import { zip, isValidDate, isFutureDate } from '../../utils/utils'

const fields = ['day', 'month', 'year']

const BodyScanValidator: Validator = ({ date, day: d, month: m, year: y, reason }: Record<string, string>) => {
  const day = parseInt(d, 10)
  const month = parseInt(m, 10)
  const year = parseInt(y, 10)

  if (!date) {
    return [{ text: 'Select a date for the body scan', href: '#date' }]
  }

  const missingFieldNames = zip(fields, [day, month, year])
    .map(([field, value]) => !value && field)
    .filter(Boolean)

  const message = missingFieldNames.join(' and ')

  if (date === 'another-date' && missingFieldNames.length)
    return [{ text: `Date must include a ${message}`, href: `#another-date-${missingFieldNames[0]}` }]

  const YEAR_REGEX = /^\d{4}$/

  if (date === 'another-date' && !YEAR_REGEX.test(y))
    return [{ text: 'Year must include 4 numbers', href: '#another-date' }]

  if (!isValidDate(d, m, y)) return [{ text: 'Date must be a real date', href: '#another-date' }]

  if (date === 'another-date' && isFutureDate(d, m, y))
    return [{ text: 'Enter a date in the past', href: '#another-date' }]

  return !reason ? [{ text: 'Select a reason for the body scan', href: '#reason' }] : []
}
export default BodyScanValidator
