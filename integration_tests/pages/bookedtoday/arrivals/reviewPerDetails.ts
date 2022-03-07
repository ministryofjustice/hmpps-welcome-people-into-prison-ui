import Page, { PageElement } from '../../page'

export default class ReviewPerDetailsPage extends Page {
  constructor() {
    super('Review personal details from Person Escort Record')
  }

  name = {
    value: () => cy.get(`.data-qa-name`),
    change: () => cy.get(`[data-qa=change-name]`),
  }

  dob = {
    value: () => cy.get(`.data-qa-dob`),
    change: () => cy.get(`[data-qa=change-dob]`),
  }

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
