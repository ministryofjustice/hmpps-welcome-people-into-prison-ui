import Page, { PageElement } from '../page'

export default class PrisonerSummaryWithRecordPage extends Page {
  constructor(title: string) {
    super(title, { hasBackLink: false })
  }

  compliancePanelText = (): PageElement => cy.get('[data-qa="compliance-panel-text"]')
}
