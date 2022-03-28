import { ValidationError, Validator } from '../../../../middleware/validationMiddleware'

const SearchForExistingRecordsValidator: Validator = ({
  firstName,
  lastName,
  day,
  month,
  year,
  prisonNumber,
  pncNumber,
}: Record<string, string>): ValidationError[] => {
  if (firstName && !lastName && (!day || !month || !year)) {
    return [{ text: 'Enter a last name and a date of birth', href: '#last-name' }]
  }

  if (!lastName && !prisonNumber && !pncNumber) {
    return [
      {
        text: "You must search using either the prisoner's last name and date of birth, prison number or PNC Number",
        href: '#last-name',
      },
    ]
  }

  if (lastName && !day && !month && !year) {
    return [{ text: 'Enter a date of birth', href: '#date-of-birth-day' }]
  }

  return []
}

export default SearchForExistingRecordsValidator
