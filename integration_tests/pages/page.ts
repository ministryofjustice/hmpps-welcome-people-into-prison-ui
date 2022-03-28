export type PageElement = Cypress.Chainable<JQuery>
export type PageConstructor<T extends Page> = new () => T

export default abstract class Page {
  static verifyOnPage<T extends Page>(constructor: PageConstructor<T>): T {
    return new constructor()
  }

  static checkLink(element: PageElement, text: string, url: string) {
    element
      .should('contain', text)
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal(url)
      })
  }

  constructor(private readonly title: string, private readonly noBackLink: boolean = false) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    cy.get('h1').contains(this.title)
    if (this.noBackLink === false) {
      cy.get('[data-qa=back-link]').should('exist')
    }
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  hasError = (message: string) => {
    cy.get('#error-summary-title').contains('There is a problem')
    cy.get('.govuk-error-summary__body').contains(message)
    cy.get('.govuk-error-message').contains(message)
  }
}
