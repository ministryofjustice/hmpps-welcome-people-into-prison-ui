import HomePage from '../pages/homePage'
import AuthSignInPage from '../pages/authSignIn'
import AuthManageDetailsPage from '../pages/authManageDetails'
import Page from '../pages/page'
import Role from '../../server/authentication/role'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
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

  it('HMPPS and Digital Prison Services links should be visible in header with the correct href', () => {
    cy.signIn()
    const homePage = Page.verifyOnPage(HomePage)
    homePage
      .hmpps()
      .should('contain', 'HMPPS')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://digital-dev.prison.service.justice.gov.uk')
      })
    homePage
      .digitalPrisonServices()
      .should('contain', 'Digital Prison Services')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://digital-dev.prison.service.justice.gov.uk')
      })
  })

  it('User caseLoad visible in location banner', () => {
    cy.signIn()
    const homePage = Page.verifyOnPage(HomePage)
    homePage.activeCaseLoad().should('contain.text', 'Moorland (HMP & YOI)')
  })

  it('Link to change location displayed in location banner for users with multiple caseloads', () => {
    cy.signIn()
    const homePage = Page.verifyOnPage(HomePage)
    homePage.changeLocationLink().should('be.visible')
  })

  it('Link to change location not displayed in location banner for users with a single caseLoad', () => {
    cy.task('stubUserCaseLoads', [
      {
        caseLoadId: 'MDI',
        description: 'Moorland (HMP & YOI)',
      },
    ])
    cy.signIn()
    const homePage = Page.verifyOnPage(HomePage)
    homePage.changeLocationLink().should('not.be.exist')
  })

  it('User can log out', () => {
    cy.signIn()
    const homePage = Page.verifyOnPage(HomePage)
    homePage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User can manage their details', () => {
    cy.signIn()
    const homePage = Page.verifyOnPage(HomePage)

    homePage.manageDetails().get('a').invoke('removeAttr', 'target')
    homePage.manageDetails().click()
    Page.verifyOnPage(AuthManageDetailsPage)
  })
})
