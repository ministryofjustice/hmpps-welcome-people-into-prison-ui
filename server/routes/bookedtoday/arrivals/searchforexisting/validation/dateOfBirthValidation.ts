import moment from 'moment'
import { Validator } from '../../../../../middleware/validationMiddleware'
import { zip } from '../../../../../utils/utils'

const fields = ['day', 'month', 'year']

const isValidDate = (d: unknown, m: unknown, y: unknown) => {
  const fullDate = `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
  return moment(fullDate, 'YYYY-MM-DD', true).isValid()
}

const DateOfBirthValidator: Validator = ({ day: d, month: m, year: y }: Record<string, string>) => {
  const day = parseInt(d, 10)
  const month = parseInt(m, 10)
  const year = parseInt(y, 10)

  if (!day && !month && !year) {
    return [{ text: "Enter this person's date of birth", href: '#date-of-birth-day' }]
  }

  if (day && month && year && !isValidDate(d, m, y)) {
    return [{ text: 'Date of birth must be a real date', href: '#date-of-birth-day' }]
  }

  const missingFieldNames = zip(fields, [day, month, year])
    .map(([field, value]) => !value && field)
    .filter(Boolean)

  const message = missingFieldNames.join(' and ')

  return !missingFieldNames.length
    ? []
    : [{ text: `Date of birth must include a ${message}`, href: `#date-of-birth-${missingFieldNames[0]}` }]
}
export default DateOfBirthValidator
