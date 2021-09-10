import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('Select prisoner to add to the establishment roll')
  }

  incomingMovementsFromCourt = (index: number): PageElement => cy.get(`[data-qa=fromCourt-title-${index}]`)

  incomingMovementsFromCustodySuite = (index: number): PageElement =>
    cy.get(`[data-qa=fromCustodySuite-title-${index}]`)

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  courtRegisterLink = (): PageElement => cy.get('[href="/court-register"]')
}
