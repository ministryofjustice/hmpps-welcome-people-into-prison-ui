import Page, { PageElement } from './page'

export default class ChoosePrisonerPage extends Page {
  constructor() {
    super('Select prisoner to add to the establishment roll')
  }

  expectedArrivalsFromCourt = (index: number): PageElement => cy.get(`[data-qa=COURT-title-${index}]`)

  expectedArrivalsFromCustodySuite = (index: number): PageElement => cy.get(`[data-qa=CUSTODY_SUITE-title-${index}]`)

  expectedArrivalsFromAnotherEstablishment = (index: number): PageElement => cy.get(`[data-qa=PRISON-title-${index}]`)

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  courtRegisterLink = (): PageElement => cy.get('[href="/court-register"]')

  prisonerImage = (index: number): PageElement => cy.get(`[data-qa=prisoner-image]`).eq(index)

  prisonerImageLink = (): PageElement => cy.get(`[data-qa=prisoner-image-link]`)

  prisonerNameLink = (): PageElement => cy.get(`[data-qa=prisoner-name-link]`)
}
