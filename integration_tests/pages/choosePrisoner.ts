import Page, { PageElement } from './page'

export default class ChoosePrisonerPage extends Page {
  constructor() {
    super('Select prisoner to add to the establishment roll')
  }

  static goTo(): ChoosePrisonerPage {
    cy.visit(`/confirm-arrival/choose-prisoner`)
    return Page.verifyOnPage(ChoosePrisonerPage)
  }

  expectedArrivalsFromCourt = (index: number): PageElement => cy.get(`[data-qa=COURT-title-${index}]`)

  noExpectedArrivalsFromCourt = (): PageElement => cy.get('[data-qa=no-arrivals-from-court]')

  expectedArrivalsFromCustodySuite = (index: number): PageElement => cy.get(`[data-qa=CUSTODY_SUITE-title-${index}]`)

  noExpectedArrivalsFromCustodySuite = (): PageElement => cy.get('[data-qa=no-arrivals-from-custody-suite]')

  expectedArrivalsFromAnotherEstablishment = (index: number): PageElement => cy.get(`[data-qa=PRISON-title-${index}]`)

  noExpectedArrivalsFromAnotherEstablishment = (): PageElement =>
    cy.get('[data-qa=no-arrivals-from-another-establishment]')

  prisonerImage = (index: number): PageElement => cy.get(`[data-qa=prisoner-image]`).eq(index)

  arrivalFrom =
    (arrivalFromType: 'COURT' | 'PRISON' | 'CUSTODY_SUITE') =>
    (row: number): Record<string, () => PageElement> => ({
      confirm: () => cy.get(`[data-qa=${arrivalFromType}-title-${row}]`).find(`[data-qa=confirm-arrival]`),
    })
}
