import Page, { PageElement } from '../../page'

export default class SummaryTransferPage extends Page {
  constructor() {
    super('Offender, Karl')
  }

  static goTo(id: string): SummaryTransferPage {
    cy.visit(`/prisoners/${id}/summary-transfer`)
    return Page.verifyOnPage(SummaryTransferPage)
  }

  confirmArrival = (): PageElement => cy.get('[data-qa=confirm-arrival]')

  breadcrumbs = () => cy.get('[data-qa=back-link-navigation]')
}
