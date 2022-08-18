import { Validator, ValidationError } from '../../middleware/validationMiddleware'
import { zip, isValidDate, isFutureDate } from '../../utils/utils'

const fields = ['day', 'month', 'year']

const anotherDateValidation = (d: string, m: string, y: string): ValidationError[] => {
  const errors: ValidationError[] = []
  const day = parseInt(d, 10)
  const month = parseInt(m, 10)
  const year = parseInt(y, 10)

  const missingFieldNames = zip(fields, [day, month, year])
    .map(([field, value]) => !value && field)
    .filter(Boolean)

  const message = missingFieldNames.join(' and ')
  const YEAR_REGEX = /^\d{4}$/

  if (missingFieldNames.length)
    errors.push({ text: `Date must include a ${message}`, href: `#another-date-${missingFieldNames[0]}` })

  if (y && !YEAR_REGEX.test(y)) errors.push({ text: 'Year must include 4 numbers', href: '#another-date' })

  if (!isValidDate(d, m, y)) errors.push({ text: 'Date must be a real date', href: '#another-date' })

  if (!missingFieldNames.length && d !== '' && m !== '' && y !== '' && isFutureDate(d, m, y))
    errors.push({ text: 'Enter a date in the past', href: '#another-date' })

  return errors
}

const BodyScanValidator: Validator = ({
  userSelectedDate,
  day: d,
  month: m,
  year: y,
  reason,
  result,
}: Record<string, string>) => {
  const errors: ValidationError[] = []

  if (!userSelectedDate) errors.push({ text: 'Select a date for the body scan', href: '#userSelectedDate' })

  if (userSelectedDate === 'another-date') errors.push(...anotherDateValidation(d, m, y))

  if (!reason) errors.push({ text: 'Select a reason for the body scan', href: '#reason' })

  if (!result) errors.push({ text: 'Select a result for the body scan', href: '#result' })

  return errors
}
export default BodyScanValidator
