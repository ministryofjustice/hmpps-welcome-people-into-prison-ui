import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('Select prisoner to add to the establishment roll')
  }

  incomingMovementsFromCourt = (index: number): PageElement => cy.get(`[data-qa=FROM_COURT-title-${index}]`)

  incomingMovementsFromCustodySuite = (index: number): PageElement =>
    cy.get(`[data-qa=FROM_CUSTODY_SUITE-title-${index}]`)

  incomingMovementsFromAnotherEstablishment = (index: number): PageElement =>
    cy.get(`[data-qa=FROM_ANOTHER_ESTABLISHMENT-title-${index}]`)

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  courtRegisterLink = (): PageElement => cy.get('[href="/court-register"]')
}
