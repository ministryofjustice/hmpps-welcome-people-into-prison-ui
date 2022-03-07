import { Validator } from '../../../../middleware/validationMiddleware'

const PRISON_NUMBER_REGEX = /^[A-Za-z]\d{4}[A-Za-z]{2}$/

const PrisonNumberValidator: Validator = ({ prisonNumber }: Record<string, string>) => {
  return prisonNumber && !PRISON_NUMBER_REGEX.test(prisonNumber)
    ? [{ text: 'Enter a prison number in the correct format', href: '#prison-number' }]
    : []
}

export default PrisonNumberValidator
