import Page, { PageElement } from './page'

export default class HomePage extends Page {
  constructor() {
    super('Welcome people into prison')
  }

  hmpps = (): PageElement => cy.get('[data-qa=hmpps]')

  digitalPrisonServices = (): PageElement => cy.get('[data-qa=digital-prison-services]')

  arrivalsTitle = (): PageElement => cy.get('[data-qa=choose-prisoner]')

  returnFromTemporaryAbsenceTitle = (): PageElement => cy.get('[data-qa=return-from-temporary-absence]')

  loggedInName = (): PageElement => cy.get('[data-qa="header-user-name"]')

  activeCaseLoad = (): PageElement => cy.get('[data-qa="active-case-load"]')

  changeLocationLink = (): PageElement => cy.get('[data-qa="change-location-link"]')
}
