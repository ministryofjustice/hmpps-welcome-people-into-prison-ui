import Page, { PageElement } from './page'

export default class MovementReasonsPage extends Page {
  constructor() {
    super('What is the type of determinate sentence?')
  }

  static goTo(id: string, movementReason: string): MovementReasonsPage {
    cy.visit(`/prisoners/${id}/${movementReason}`)
    return Page.verifyOnPage(MovementReasonsPage)
  }

  prisonerName = (): PageElement => cy.get(`[data-qa=prisoner-name]`)

  extendedSentenceRadioButton = (): PageElement => cy.get(`[data-qa=movement-reason-1]`)

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
