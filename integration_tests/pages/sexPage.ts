import ImprisonmentStatusPage from './imprisonmentStatus'
import Page, { PageElement } from './page'

export default class SexPage extends Page {
  constructor() {
    super('What is their sex?')
  }

  static goTo(id: string): SexPage {
    cy.visit(`/prisoners/${id}/sex`)
    return Page.verifyOnPage(SexPage)
  }

  static goToWithRedirect(id: string): ImprisonmentStatusPage {
    cy.visit(`/prisoners/${id}/sex`)
    return Page.verifyOnPage(ImprisonmentStatusPage)
  }

  errorSummaryTitle = (): PageElement => cy.get('#error-summary-title')

  errorSummaryBody = (): PageElement => cy.get('.govuk-error-summary__body')

  errorSummaryMessage = (): PageElement => cy.get('.govuk-error-message')

  prisonerName = (): PageElement => cy.get(`[data-qa=prisoner-name]`)

  sexRadioButtons = (value): PageElement => cy.get('.govuk-radios__input[type="radio"]').check(value)

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
