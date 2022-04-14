import { Validator } from '../../../middleware/validationMiddleware'

const PNC_NUMBER_REGEX = /^([0-9]{2}|[0-9]{4})\/[0-9]{5}[a-zA-Z]/

const PncNumberValidator: Validator = ({ pncNumber }: Record<string, string>) => {
  return pncNumber && !PNC_NUMBER_REGEX.test(pncNumber)
    ? [{ text: 'Enter a PNC number in the format 01/23456A or 2001/23456A', href: '#pnc-number' }]
    : []
}

export default PncNumberValidator
