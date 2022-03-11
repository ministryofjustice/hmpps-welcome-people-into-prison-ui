import MatchedRecordSelectionValidation from './matchedRecordSelectionValidation'

describe('MatchedRecordSelectionValidation', () => {
  it('Should return empty error array if prison number is provided', () =>
    expect(MatchedRecordSelectionValidation({ prisonNumber: 'A1234BC' })).toEqual([]))

  it('Should return error if prison number not provided', () =>
    expect(MatchedRecordSelectionValidation({})).toEqual([
      {
        href: '#record-1',
        text: 'Select an existing record or search using different details',
      },
    ]))
})
