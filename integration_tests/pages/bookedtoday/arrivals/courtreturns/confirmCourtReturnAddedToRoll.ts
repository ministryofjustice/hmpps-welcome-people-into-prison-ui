import Page, { PageElement } from '../../../page'

export default class ConfirmCourtReturnAddedToRollPage extends Page {
  constructor() {
    super('has returned to Moorland (HMP & YOI)')
  }

  addAnotherToRoll = (): PageElement => cy.get(`[data-qa=add-another-to-roll]`)

  viewEstablishmentRoll = (): PageElement => cy.get(`[data-qa=view-establishment-roll]`)

  backToDigitalPrisonServices = (): PageElement => cy.get('[data-qa=back-to-dps]')
}
