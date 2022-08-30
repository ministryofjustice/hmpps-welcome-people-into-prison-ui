import Page, { PageElement } from '../page'

export default class TemporaryAbsencesPage extends Page {
  constructor() {
    super('Prisoners currently out on temporary absence')
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
    doNotScan: () => cy.get(`[data-qa=temporary-absence-${row}] [data-qa="do-not-scan"]`),
  })

  prisonerImage = (index: number) => ({
    check({ href, alt }: { href: string; alt: string }) {
      Page.checkImage(cy.get(`[data-qa=prisoner-image]`).eq(index), href, alt)
    },
  })

  linkToExpectedArrivals = (): PageElement => cy.get(`[data-qa=linkToExpectedArrivals]`)
}
