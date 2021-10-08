import Page, { PageElement } from './page'

export default class ChoosePrisonerPage extends Page {
  constructor() {
    super('Select prisoner to add to the establishment roll')
  }

  expectedArrivalsFromCourt = (index: number): PageElement => cy.get(`[data-qa=COURT-title-${index}]`)

  expectedArrivalsFromCustodySuite = (index: number): PageElement => cy.get(`[data-qa=CUSTODY_SUITE-title-${index}]`)

  expectedArrivalsFromAnotherEstablishment = (index: number): PageElement => cy.get(`[data-qa=PRISON-title-${index}]`)

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  prisonerImage = (index: number): PageElement => cy.get(`[data-qa=prisoner-image]`).eq(index)

  arrivalFrom =
    (arrivalFromType: string) =>
    (row: number): Record<string, () => PageElement> => ({
      confirm: () => cy.get(`[data-qa=${arrivalFromType}-title-${row}]`).find(`[data-qa=confirm-arrival]`),
    })
}
