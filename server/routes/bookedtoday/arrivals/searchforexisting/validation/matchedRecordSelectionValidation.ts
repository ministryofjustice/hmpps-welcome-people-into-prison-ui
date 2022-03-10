import { Validator } from '../../../../../middleware/validationMiddleware'

const MatchedRecordSelectionValidation: Validator = ({ prisonNumber }: Record<string, string>) => {
  return prisonNumber
    ? []
    : [{ text: 'Select an existing record or search using different details', href: '#record-1' }]
}

export default MatchedRecordSelectionValidation
