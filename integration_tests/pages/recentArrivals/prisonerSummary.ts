import Page, { PageElement, BackLink } from '../page'

export default class PrisonerSummaryPage extends Page {
  constructor(title: string, hasBackLink: BackLink) {
    super(title, hasBackLink)
  }

  compliancePanelText = (): PageElement => cy.get('[data-qa="compliance-panel-text"]')
}
