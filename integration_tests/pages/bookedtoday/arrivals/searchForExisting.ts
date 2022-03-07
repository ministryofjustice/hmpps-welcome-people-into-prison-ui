import Page, { PageElement } from '../../page'

export default class SearchForExistingPage extends Page {
  constructor() {
    super('Search for an existing prisoner record')
  }

  name = {
    value: () => cy.get(`.data-qa-name`),
    change: () => cy.get(`[data-qa=change-name]`),
  }

  dob = {
    value: () => cy.get(`.data-qa-dob`),
    change: () => cy.get(`[data-qa=change-dob]`),
  }

  pnc = {
    value: () => cy.get(`.data-qa-pnc-number`),
    change: () => cy.get(`[data-qa=change-pnc]`),
    remove: () => cy.get(`[data-qa=remove-pnc]`),
  }

  prisonNumber = {
    value: () => cy.get(`.data-qa-prison-number`),
    change: () => cy.get(`[data-qa=change-prison-number]`),
    remove: () => cy.get(`[data-qa=remove-prison-number]`),
  }

  returnToArrivalsList = (): PageElement => cy.get(`[data-qa=return-to-arrivals-list]`)
}
