import Page, { PageElement } from './page'

export default class ConfirmCourtReturnAddedToRollPage extends Page {
  constructor() {
    super('has returned to Moorland (HMP & YOI)')
  }

  static goTo(id: string): ConfirmCourtReturnAddedToRollPage {
    cy.visit(`/prisoners/${id}/prisoner-returned-from-court`)
    return Page.verifyOnPage(ConfirmCourtReturnAddedToRollPage)
  }

  addAnotherToRoll = (): PageElement => cy.get(`[data-qa=add-another-to-roll]`)

  viewEstablishmentRoll = (): PageElement => cy.get(`[data-qa=view-establishment-roll]`)

  backToDigitalPrisonServices = (): PageElement => cy.get('[data-qa=back-to-dps]')
}
