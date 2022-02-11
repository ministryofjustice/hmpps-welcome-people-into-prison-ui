import Page, { PageElement } from '../../../page'

export default class CheckCourtReturnPage extends Page {
  constructor() {
    super('This person is returning from court')
  }

  static goTo(id: string): CheckCourtReturnPage {
    cy.visit(`/prisoners/${id}/check-court-return`)
    return Page.verifyOnPage(CheckCourtReturnPage)
  }

  list = (): PageElement => cy.get(`[data-qa=list]`)

  addToRoll = (): PageElement => cy.get(`[data-qa=add-to-roll]`)

  returnToArrivalsList = (): PageElement => cy.get(`[data-qa=return-to-arrivals-list]`)
}
