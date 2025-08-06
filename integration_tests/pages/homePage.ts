import Page, { PageElement } from './page'

export default class HomePage extends Page {
  constructor() {
    super('Welcome people into prison', { hasBackLink: false })
  }

  hmpps = (): PageElement => cy.get('[data-qa=hmpps]')

  digitalPrisonServices = (): PageElement => cy.get('[data-qa=digital-prison-services]')

  arrivalsTitle = (): PageElement => cy.get('[data-qa=choose-prisoner]')

  returnFromTemporaryAbsenceTitle = (): PageElement => cy.get('[data-qa=return-from-temporary-absence]')

  recentArrivalsTitle = (): PageElement => cy.get('[data-qa=recent-arrivals]')

  dpsLink = (): PageElement => cy.get('[data-qa=dps-link]')

  loggedInName = (): PageElement => cy.get('[data-qa="header-user-name"]')

  activeCaseLoad = (): PageElement => cy.get('[data-qa="active-case-load"]')

  changeLocationLink = (): PageElement => cy.get('[data-qa="change-location-link"]')

  commonComponentsHeader = (): PageElement => cy.get('header').contains('Common Components Header')

  commonComponentsFooter = (): PageElement => cy.get('footer').contains('Common Components Footer')

  fallbackHeaderUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  managementReportTitle = (): PageElement => cy.get('[data-qa=management-reporting]')
}
