import Page, { PageElement } from '../../../page'

export default class MovementReasonsPage extends Page {
  constructor() {
    super('What is the')
  }

  backLink = (): PageElement => cy.get(`[data-qa=back-link]`)

  prisonerName = (): PageElement => cy.get(`[data-qa=prisoner-name]`)

  movementReasonRadioButton = (value): PageElement => cy.get('.govuk-radios__input[type="radio"]').check(value)

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
