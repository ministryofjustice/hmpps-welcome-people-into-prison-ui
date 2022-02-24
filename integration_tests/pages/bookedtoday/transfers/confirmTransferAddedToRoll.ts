import Page, { PageElement } from '../../page'

export default class ConfirmTransferAddedToRollPage extends Page {
  constructor() {
    super('has been added to the establishment roll')
  }

  addAnotherToRoll = (): PageElement => cy.get(`[data-qa=add-another-to-roll]`)

  viewEstablishmentRoll = (): PageElement => cy.get(`[data-qa=view-establishment-roll]`)

  backToDigitalPrisonServices = (): PageElement => cy.get('[data-qa=back-to-dps]')
}
