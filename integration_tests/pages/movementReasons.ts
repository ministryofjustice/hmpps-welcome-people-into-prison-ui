import Page, { PageElement } from './page'

export default class MovementReasonsPage extends Page {
  constructor() {
    super('What is the')
  }

  static goTo(id: string, movementReason: string): MovementReasonsPage {
    cy.visit(`/prisoners/${id}/imprisonment-status/${movementReason}`)
    return Page.verifyOnPage(MovementReasonsPage)
  }

  errorSummaryTitle = (): PageElement => cy.get('#error-summary-title')

  errorSummaryBody = (): PageElement => cy.get('.govuk-error-summary__body')

  errorSummaryMessage = (): PageElement => cy.get('.govuk-error-message')

  prisonerName = (): PageElement => cy.get(`[data-qa=prisoner-name]`)

  movementReasonRadioButton = (value): PageElement => cy.get('.govuk-radios__input[type="radio"]').check(value)

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
