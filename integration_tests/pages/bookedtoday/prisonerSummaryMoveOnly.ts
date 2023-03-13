import Page, { PageElement } from '../page'

export default class PrisonerSummaryMoveOnlyPage extends Page {
  constructor(title: string) {
    super(title, { hasBackLink: false })
  }

  breadcrumbs = (): PageElement => cy.get('[data-qa=breadcrumbs]')

  confirmArrival = (): PageElement => cy.get('[data-qa=confirm-arrival]')
}
