import HomePage from '../pages/homePage'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'
import Role from '../../server/authentication/role'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', [Role.PRISON_RECEPTION])
    cy.task('stubUserCaseLoads')
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [] })
    cy.task('stubMissingPrisonerImage')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User name visible in header', () => {
    cy.signIn()
    const homePage = Page.verifyOnPage(HomePage)
    homePage.loggedInName().should('contain.text', 'J. Smith')
  })

  it('User can log out', () => {
    cy.signIn()
    const homePage = Page.verifyOnPage(HomePage)
    homePage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })
})
