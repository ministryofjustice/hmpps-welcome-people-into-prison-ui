import Page, { PageElement } from '../../page'

export default class AddPersonalDetailsPage extends Page {
  constructor() {
    super("Add prisoner's personal details")
  }

  firstName = (): PageElement => cy.get('[data-qa=first-name]')

  lastName = (): PageElement => cy.get('[data-qa=last-name]')

  day = (): PageElement => cy.get('[data-qa=day]')

  month = (): PageElement => cy.get('[data-qa=month]')

  year = (): PageElement => cy.get('[data-qa=year]')

  sex = (): PageElement => cy.get('.govuk-radios__input[type="radio"]')

  otherSearchDetails = (): PageElement => cy.get('[data-qa=other-search-details]')

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
