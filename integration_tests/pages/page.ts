export type PageElement = Cypress.Chainable<JQuery>
export type PageConstructor<T extends Page> = new () => T

export default abstract class Page {
  static verifyOnPage<T extends Page>(constructor: PageConstructor<T>): T {
    return new constructor()
  }

  constructor(private readonly title: string) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    cy.get('h1').contains(this.title)
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  hasError = (message: string) => {
    cy.get('#error-summary-title').contains('There is a problem')
    cy.get('.govuk-error-summary__body').contains(message)
    cy.get('.govuk-error-message').contains(message)
  }
}
