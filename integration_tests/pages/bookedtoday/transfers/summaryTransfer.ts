import Page, { PageElement } from '../../page'

export default class SummaryTransferPage extends Page {
  constructor(title: string) {
    super(title)
  }

  confirmArrival = (): PageElement => cy.get('[data-qa=confirm-arrival]')

  breadcrumbs = () => cy.get('[data-qa=back-link-navigation]')

  prisonerProfile = (): PageElement => cy.get('[data-qa=prisoner-profile]')
}
