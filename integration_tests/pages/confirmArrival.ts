import Page, { PageElement } from './page'

export default class ConfirmArrivalPage extends Page {
  constructor() {
    super('Check this record matches the person in reception')
  }

  static goTo(id: string): ConfirmArrivalPage {
    cy.visit(`/prisoners/${id}/confirm-arrival`)
    return Page.verifyOnPage(ConfirmArrivalPage)
  }

  prisonerImage = (): PageElement => cy.get(`[data-qa=prisoner-image]`)

  name = (): PageElement => cy.get(`[data-qa=prisoner-name]`)

  dob = (): PageElement => cy.get(`[data-qa=dob]`)

  prisonNumber = (): PageElement => cy.get(`[data-qa=prison-number]`)

  pncNumber = (): PageElement => cy.get(`[data-qa=pnc-number]`)

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
