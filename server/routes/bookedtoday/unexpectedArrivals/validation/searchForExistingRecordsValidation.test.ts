import SearchForExistingRecordsValidation from './searchForExistingRecordsValidation'

describe('MatchedRecordSelectionValidation', () => {
  it('Should return error if nothing is entered', () =>
    expect(SearchForExistingRecordsValidation({})).toEqual([
      {
        text: "You must search using either the prisoner's last name and date of birth, prison number or PNC Number",
        href: '#last-name',
      },
    ]))

  it('Should return error if only date of birth is entered', () =>
    expect(SearchForExistingRecordsValidation({ day: '02', month: '01', year: '2000' })).toEqual([
      {
        href: '#last-name',
        text: "You must search using either the prisoner's last name and date of birth, prison number or PNC Number",
      },
    ]))

  it('Should return error if only DOB and prison number', () =>
    expect(
      SearchForExistingRecordsValidation({ day: '02', month: '01', year: '2000', prisonNumber: 'A1234BC' })
    ).toEqual([
      {
        href: '#last-name',
        text: "You must search using either the prisoner's last name and date of birth, prison number or PNC Number",
      },
    ]))

  it('Should return error if only first name entered', () =>
    expect(SearchForExistingRecordsValidation({ firstName: 'James' })).toEqual([
      { href: '#last-name', text: 'Enter a last name and a date of birth' },
    ]))

  it('Should return error if only first name and last name entered', () =>
    expect(SearchForExistingRecordsValidation({ firstName: 'James', lastName: 'Smith' })).toEqual([
      { href: '#date-of-birth-day', text: 'Enter a date of birth' },
    ]))

  it('Should return error if only first name and date of birth entered', () =>
    expect(SearchForExistingRecordsValidation({ firstName: 'James', day: '02', month: '01', year: '2000' })).toEqual([
      { href: '#last-name', text: 'Enter a last name' },
    ]))

  it('Should return error if only last name entered', () =>
    expect(SearchForExistingRecordsValidation({ lastName: 'Smith' })).toEqual([
      { href: '#date-of-birth-day', text: 'Enter a date of birth' },
    ]))
})
