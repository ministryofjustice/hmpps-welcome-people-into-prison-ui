import Page, { PageElement } from './page'

export default class HomePage extends Page {
  constructor() {
    super('Welcome people into prison')
  }

  static goTo(): HomePage {
    cy.visit(`/`)
    return Page.verifyOnPage(HomePage)
  }

  arrivalsTitle = (): PageElement => cy.get('[data-qa=choose-prisoner]')

  returnFromTemporaryAbsenceTitle = (): PageElement => cy.get('[data-qa=return-from-temporary-absence]')

  loggedInName = (): PageElement => cy.get('[data-qa="header-user-name"]')
}
