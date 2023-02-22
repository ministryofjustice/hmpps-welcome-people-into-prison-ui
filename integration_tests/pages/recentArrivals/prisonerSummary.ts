import Page, { PageElement } from '../page'

export default class PrisonerSummaryPage extends Page {
  constructor(title, hasBackLink, hasFeedbackBanner) {
    super(title, hasBackLink, hasFeedbackBanner)
  }

  static goTo(prisonId: string, title: string, hasBackLink: boolean, hasFeedbackBanner: boolean): PrisonerSummaryPage {
    cy.visit(`/recent-arrivals/${prisonId}/summary`)
    return new PrisonerSummaryPage(title, hasBackLink, hasFeedbackBanner)
  }

  compliancePanelText = (): PageElement => cy.get('[data-qa="compliance-panel-text"]')
}
