import Page from '../pages/page'
import Role from '../../server/authentication/role'
import HomePage from '../pages/homePage'

context('WPIP homepage should display API Header and footer components', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', [Role.PRISON_RECEPTION])
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.visit('/')
  })

  it('New components should be displayed', () => {
    cy.task('stubComponents')
    cy.signIn()
    const homePage = Page.verifyOnPage(HomePage)
    homePage.commonComponentsHeader().should('exist')
    homePage.commonComponentsFooter().should('exist')
  })

  it('New components should not be displayed', () => {
    cy.task('stubComponentsFail')
    cy.signIn()
    const homePage = Page.verifyOnPage(HomePage)
    homePage.commonComponentsHeader().should('not.exist')
    homePage.commonComponentsFooter().should('not.exist')
    homePage.fallbackHeaderUserName().contains('J. Smith')
  })
})
