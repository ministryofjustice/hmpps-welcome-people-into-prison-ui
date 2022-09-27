import Page, { PageElement } from '../page'

export default class CheckTemporaryAbsencePage extends Page {
  constructor() {
    super('This person will be returned to prison')
  }

  static goTo(id: string): CheckTemporaryAbsencePage {
    cy.visit(`/prisoners/${id}/check-temporary-absence`)
    return Page.verifyOnPage(CheckTemporaryAbsencePage)
  }

  addToRoll = (): PageElement => cy.get(`[data-qa=add-to-roll]`)

  arrivalId = (): PageElement => cy.get(`input[name=arrivalId]`)

  returnToTemporaryAbsencesList = (): PageElement => cy.get('[data-qa=return-to-temporary-absences-list]')
}
