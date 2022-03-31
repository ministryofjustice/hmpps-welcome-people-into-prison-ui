import SexValidation from './sexValidation'

describe('SexValidation', () => {
  it('Should return error if an option is not selected', () =>
    expect(SexValidation({})).toEqual([
      {
        text: "Select this person's sex",
        href: '#sex',
      },
    ]))

  it('Should not return an error', () => expect(SexValidation({ sex: 'F' })).toEqual([]))
})
