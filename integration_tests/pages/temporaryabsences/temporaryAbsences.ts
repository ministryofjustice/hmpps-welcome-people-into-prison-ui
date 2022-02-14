import Page, { PageElement } from '../page'

export default class TemporaryAbsencesPage extends Page {
  constructor() {
    super('Select prisoner returning from temporary absence')
  }

  static goTo(): TemporaryAbsencesPage {
    cy.visit('/prisoners-returning')
    return Page.verifyOnPage(TemporaryAbsencesPage)
  }

  temporaryAbsences = (row: number): Record<string, () => PageElement> => ({
    confirm: () => cy.get(`[data-qa=temporaryAbsence-title-${row}]`),
    name: () => cy.get(`[data-qa=temporaryAbsence-title-${row}]`),
    dob: () => cy.get(`[data-qa=temporaryAbsence-dob-${row}]`),
    prisonNumber: () => cy.get(`[data-qa=temporaryAbsence-prisonNumber-${row}]`),
    reasonForAbsence: () => cy.get(`[data-qa=temporaryAbsence-reasonForAbsence-${row}]`),
    movementDateTime: () => cy.get(`[data-qa=temporaryAbsence-movementDateTime-${row}]`),
  })

  prisonerImage = (index: number): PageElement => cy.get(`[data-qa=prisoner-image]`).eq(index)

  linkToExpectedArrivals = (): PageElement => cy.get(`[data-qa=linkToExpectedArrivals]`)
}
