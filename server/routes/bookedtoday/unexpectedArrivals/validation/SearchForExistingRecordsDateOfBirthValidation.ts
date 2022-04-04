import { Validator } from '../../../../middleware/validationMiddleware'
import { zip, isValidDate } from '../../../../utils/utils'

const fields = ['day', 'month', 'year']

const SearchForExistingRecordsDateOfBirthValidation: Validator = ({
  day: d,
  month: m,
  year: y,
}: Record<string, string>) => {
  const day = parseInt(d, 10)
  const month = parseInt(m, 10)
  const year = parseInt(y, 10)

  const missingFieldNames = zip(fields, [day, month, year])
    .map(([field, value]) => !value && field)
    .filter(Boolean)

  const message = missingFieldNames.join(' and ')

  if ((day || month || year) && missingFieldNames.length) {
    return [{ text: `Date of birth must include a ${message}`, href: `#date-of-birth-${missingFieldNames[0]}` }]
  }

  return isValidDate(d, m, y) ? [] : [{ text: 'Date of birth must be a real date', href: '#date-of-birth-day' }]
}
export default SearchForExistingRecordsDateOfBirthValidation
