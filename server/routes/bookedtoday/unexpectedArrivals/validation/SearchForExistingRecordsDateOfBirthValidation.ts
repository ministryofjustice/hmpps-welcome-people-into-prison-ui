import { Validator } from '../../../../middleware/validationMiddleware'
import { zip } from '../../../../utils/utils'

type ValidationError = { text?: string; href: string }

const fields = ['day', 'month', 'year']

const SearchForExistingRecordsDateOfBirthValidation: Validator = ({
  day: d,
  month: m,
  year: y,
}: Record<string, string>) => {
  const day = parseInt(d, 10)
  const month = parseInt(m, 10)
  const year = parseInt(y, 10)
  let errors = [] as ValidationError[]

  if (day || month || year) {
    const missingFieldNames = zip(fields, [day, month, year])
      .map(([field, value]) => !value && field)
      .filter(Boolean)

    const message = missingFieldNames.join(' and ')
    errors = !missingFieldNames.length
      ? []
      : [{ text: `Date of birth must include a ${message}`, href: `#date-of-birth-${missingFieldNames[0]}` }]
  }

  return errors
}
export default SearchForExistingRecordsDateOfBirthValidation
