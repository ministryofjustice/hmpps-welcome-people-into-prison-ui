import Page, { PageElement } from '../../page'

export default class ReviewDetailsPage extends Page {
  constructor() {
    super('Review personal details')
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
