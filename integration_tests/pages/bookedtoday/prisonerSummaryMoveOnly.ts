import Page, { PageElement } from '../page'

export default class PrisonerSummaryMoveOnlyPage extends Page {
  constructor(title: string) {
    super(title)
  }

  breadcrumbs = (): PageElement => cy.get('[data-qa=back-link-navigation]')

  confirmArrival = (): PageElement => cy.get('[data-qa=confirm-arrival]')
}
