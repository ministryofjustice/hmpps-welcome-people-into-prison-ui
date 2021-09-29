import Page, { PageElement } from './page'

export default class ChoosePrisonerPage extends Page {
  constructor() {
    super('Select prisoner to add to the establishment roll')
  }

  expectedArrivalsFromCourt = (index: number): PageElement => cy.get(`[data-qa=FROM_COURT-title-${index}]`)

  expectedArrivalsFromCustodySuite = (index: number): PageElement =>
    cy.get(`[data-qa=FROM_CUSTODY_SUITE-title-${index}]`)

  expectedArrivalsFromAnotherEstablishment = (index: number): PageElement =>
    cy.get(`[data-qa=FROM_ANOTHER_ESTABLISHMENT-title-${index}]`)

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  courtRegisterLink = (): PageElement => cy.get('[href="/court-register"]')

  prisonerImage = (child: number): PageElement => cy.get(`[data-qa=prisoner-image`).eq(child)
}
