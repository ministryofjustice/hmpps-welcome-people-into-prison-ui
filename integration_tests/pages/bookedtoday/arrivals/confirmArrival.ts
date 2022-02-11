import Page, { PageElement } from '../../page'

export default class ConfirmArrivalPage extends Page {
  constructor() {
    super(' an existing prisoner record')
  }

  static goTo(id: string): ConfirmArrivalPage {
    cy.visit(`/prisoners/${id}/confirm-arrival`)
    return Page.verifyOnPage(ConfirmArrivalPage)
  }

  perName = (): PageElement => cy.get(`.data-qa-per-record-prisoner-name`)

  perDob = (): PageElement => cy.get(`.data-qa-per-record-dob`)

  perPrisonNumber = (): PageElement => cy.get(`.data-qa-per-record-prison-number`)

  perPncNumber = (): PageElement => cy.get(`.data-qa-per-record-pnc-number`)

  existingName = (): PageElement => cy.get(`.data-qa-existing-record-prisoner-name`)

  existingDob = (): PageElement => cy.get(`.data-qa-existing-record-dob`)

  existingPrisonNumber = (): PageElement => cy.get(`.data-qa-existing-record-prison-number`)

  existingPncNumber = (): PageElement => cy.get(`.data-qa-existing-record-pnc-number`)

  prisonerImage = (): PageElement => cy.get(`[data-qa=prisoner-image]`)

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
