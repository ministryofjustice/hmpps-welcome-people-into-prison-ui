import Page, { PageElement } from './page'

export default class ConfirmTransferAddedToRollPage extends Page {
  constructor() {
    super('has been added to the establishment roll')
  }

  static goTo(id: string): ConfirmTransferAddedToRollPage {
    cy.visit(`/prisoners/${id}/confirm-transfer`)
    return Page.verifyOnPage(ConfirmTransferAddedToRollPage)
  }

  addAnotherToRoll = (): PageElement => cy.get(`[data-qa=add-another-to-roll]`)

  backToDigitalPrisonServices = (): PageElement => cy.get('[data-qa=back-to-dps]')
}
