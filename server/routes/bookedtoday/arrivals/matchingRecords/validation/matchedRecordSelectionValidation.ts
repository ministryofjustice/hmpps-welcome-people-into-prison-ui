import { Validator } from '../../../../../middleware/validationMiddleware'

const MatchedRecordSelectionValidation: Validator = ({ prisonNumber }: Record<string, string>) => {
  return prisonNumber ? [] : [{ text: 'You must select an option', href: '#record-1' }]
}

export default MatchedRecordSelectionValidation
