import Page, { PageElement } from './page'

export default class ImprisonmentStatusPage extends Page {
  constructor() {
    super('What is the reason for imprisonment?')
  }

  static goTo(id: string): ImprisonmentStatusPage {
    cy.visit(`/prisoners/${id}/imprisonment-status`)
    return Page.verifyOnPage(ImprisonmentStatusPage)
  }

  errorSummaryTitle = (): PageElement => cy.get('#error-summary-title')

  errorSummaryBody = (): PageElement => cy.get('.govuk-error-summary__body')

  errorSummaryMessage = (): PageElement => cy.get('.govuk-error-message')

  prisonerName = (): PageElement => cy.get(`[data-qa=prisoner-name]`)

  imprisonmentStatusRadioButton = (value): PageElement => cy.get('.govuk-radios__input[type="radio"]').check(value)

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
