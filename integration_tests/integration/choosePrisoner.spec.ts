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
    indexPage.incomingMovementsFromCourt(1).should('contain.text', 'Doe, John')
    indexPage.incomingMovementsFromCourt(2).should('contain.text', 'Smith, Sam')
  })

  it('A user can view list of incoming movements from custody suites', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.incomingMovementsFromCustodySuite(1).should('contain.text', 'Prisoner, Mark')
    indexPage.incomingMovementsFromCustodySuite(2).should('contain.text', 'Smith, Barry')
    indexPage.incomingMovementsFromCustodySuite(3).should('contain.text', 'Smith, Bob')
  })

  it('A user can view list of incoming movements from another establishement', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.incomingMovementsFromAnotherEstablishment(1).should('contain.text', 'Offender, Karl')
  })
})
