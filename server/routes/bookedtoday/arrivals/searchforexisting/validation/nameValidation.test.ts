import NameValidator from './nameValidation'

describe('NameValidator', () => {
  it('First name required', () =>
    expect(NameValidator({ lastName: 'Smith' })).toEqual([
      {
        href: '#first-name',
        text: "Enter this person's first name",
      },
    ]))

  it('Last name required', () =>
    expect(NameValidator({ firstName: 'Sam' })).toEqual([
      {
        href: '#last-name',
        text: "Enter this person's last name",
      },
    ]))
})
