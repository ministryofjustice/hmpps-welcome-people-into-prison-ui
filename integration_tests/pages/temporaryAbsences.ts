import Page, { PageElement } from './page'

export default class TemporaryAbsencesPage extends Page {
  constructor() {
    super('Select prisoner returning from temporary absence')
  }

  static goTo(): TemporaryAbsencesPage {
    cy.visit('/prisoners-returning')
    return Page.verifyOnPage(TemporaryAbsencesPage)
  }

  temporaryAbsences = (index: number): PageElement => cy.get(`[data-qa=temporaryAbsence-title-${index}]`)

  prisonerImage = (index: number): PageElement => cy.get(`[data-qa=prisoner-image]`).eq(index)
}
