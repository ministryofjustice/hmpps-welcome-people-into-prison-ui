export type PageElement = Cypress.Chainable<JQuery>
export type PageConstructor<T extends Page> = new () => T
export type BackLink = { hasBackLink: boolean }
export type FeedbackBanner = { hasFeedbackBanner: boolean }

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

  static checkImage(element: PageElement, href: string, alt: string) {
    element.should('be.visible').then(e => {
      cy.wrap(e)
        .should('have.attr', 'src')
        .then(src => expect(src).equal(href))
      cy.wrap(e)
        .should('have.attr', 'alt')
        .then(altAttr => expect(altAttr).equal(alt))
    })
  }

  constructor(
    private readonly title: string,
    private readonly backNavigationLink: BackLink = { hasBackLink: true },
    private readonly feedbackBannerLink: FeedbackBanner = { hasFeedbackBanner: true }
  ) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    cy.get('h1').contains(this.title)
    if (this.backNavigationLink.hasBackLink !== false) {
      this.backNavigation().should('exist')
    } else {
      this.backNavigation().should('not.exist')
    }
    if (this.feedbackBannerLink.hasFeedbackBanner !== false) {
      this.feedbackBanner().should('exist')
    } else {
      this.feedbackBanner().should('not.exist')
    }
  }

  feedbackBanner = (): PageElement => cy.get(`[data-qa=feedback-link]`)

  backNavigation = (): PageElement => cy.get(`[data-qa=back-link]`)

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  hasError = (message: string) => {
    cy.get('.govuk-error-summary__title').contains('There is a problem')
    cy.get('.govuk-error-summary__body').contains(message)
    cy.get('.govuk-error-message').contains(message)
  }
}
