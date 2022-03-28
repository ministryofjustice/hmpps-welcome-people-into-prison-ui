import Page, { PageElement } from '../../../page'

export default class CheckAnswersPage extends Page {
  constructor() {
    super('Check your answers before adding')
  }

  name = (): PageElement => cy.get('.data-qa-prisoner-name')

  dob = (): PageElement => cy.get('.data-qa-dob')

  prisonNumber = (): PageElement => cy.get('.data-qa-prison-number')

  pncNumber = (): PageElement => cy.get('.data-qa-pnc-number')

  sex = (): PageElement => cy.get('.data-qa-sex')

  reason = (): PageElement => cy.get('.data-qa-reason')

  addToRoll = (): PageElement => cy.get('[data-qa=add-to-roll]')
}
