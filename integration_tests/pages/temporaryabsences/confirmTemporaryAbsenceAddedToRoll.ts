import Page, { PageElement } from '../page'

export default class ConfirmTemporaryAbsenceAddedToRollPage extends Page {
  constructor() {
    super('has returned to Moorland (HMP & YOI)', true)
  }

  static goTo(id: string): ConfirmTemporaryAbsenceAddedToRollPage {
    cy.visit(`/prisoners/${id}/prisoner-returned`)
    return Page.verifyOnPage(ConfirmTemporaryAbsenceAddedToRollPage)
  }

  viewEstablishmentRoll = (): PageElement => cy.get(`[data-qa=view-establishment-roll]`)

  backToDigitalPrisonServices = (): PageElement => cy.get('[data-qa=back-to-dps]')
}
