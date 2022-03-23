import { ValidationError, Validator } from '../../../../middleware/validationMiddleware'
import { isValidDate } from './dateOfBirthValidation'

const SearchForExistingRecordsValidator: Validator = ({
  firstName,
  lastName,
  day,
  month,
  year,
  prisonNumber,
  pncNumber,
}: Record<string, string>): ValidationError[] => {
  if (!lastName && !prisonNumber && !pncNumber && firstName) {
    return [{ text: 'Enter a last name', href: '#last-name' }]
  }

  if (!lastName && !prisonNumber && !pncNumber) {
    return [
      {
        text: "You must search using either the prisoner's last name, prison number or PNC Number",
        href: '#last-name',
      },
    ]
  }

  if (!lastName && !prisonNumber && !pncNumber && day && month && year && isValidDate(day, month, year)) {
    return [
      {
        text: "You must search using either the prisoner's last name, prison number or PNC Number",
        href: '#last-name',
      },
    ]
  }

  return []
}

export default SearchForExistingRecordsValidator
