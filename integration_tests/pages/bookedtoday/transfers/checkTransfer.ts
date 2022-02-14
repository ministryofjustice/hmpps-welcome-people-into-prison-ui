import Page, { PageElement } from '../../page'

export default class CheckTransferPage extends Page {
  constructor() {
    super('This person is being transferred from another establishment')
  }

  static goTo(id: string): CheckTransferPage {
    cy.visit(`/prisoners/${id}/check-transfer`)
    return Page.verifyOnPage(CheckTransferPage)
  }

  choosePrisoner = (): PageElement => cy.get('[data-qa=choose-prisoner]')

  addToRoll = (): PageElement => cy.get('[data-qa=add-to-roll]')
}
