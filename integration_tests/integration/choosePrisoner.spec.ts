import IndexPage from '../pages/index'
import Page from '../pages/page'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubIncomingMovements', 'MDI')
  })

  it('A user can view list of incoming movements from courts', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.inComingMovementsFromCourt(1).should('contain.text', 'Doe, John')
    indexPage.inComingMovementsFromCourt(2).should('contain.text', 'Smith, Sam')
  })

  it('A user can view list of incoming movements from custody suites', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.inComingMovementsFromCustodySuite(1).should('contain.text', 'Prisoner, Mark')
    indexPage.inComingMovementsFromCustodySuite(2).should('contain.text', 'Smith, Barry')
    indexPage.inComingMovementsFromCustodySuite(3).should('contain.text', 'Smith, Bob')
  })
})
