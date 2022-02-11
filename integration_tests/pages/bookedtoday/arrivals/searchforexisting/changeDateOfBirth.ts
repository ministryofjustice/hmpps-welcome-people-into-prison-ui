import Page, { PageElement } from '../../../page'

export default class ChangeDateOfBirthPage extends Page {
  constructor() {
    super("Change this person's date of birth")
  }

  day = (): PageElement => cy.get('#date-of-birth-day')

  month = (): PageElement => cy.get('#date-of-birth-month')

  year = (): PageElement => cy.get('#date-of-birth-year')

  save = (): PageElement => cy.get(`[data-qa=save]`)
}
