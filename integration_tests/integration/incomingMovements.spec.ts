import IncomingMovementsPage from '../pages/incomingMovements'
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
    const incomingMovementsPage = Page.verifyOnPage(IncomingMovementsPage)
    incomingMovementsPage.incomingMovementsFromCourt(1).should('contain.text', 'Doe, John')
    incomingMovementsPage.incomingMovementsFromCourt(2).should('contain.text', 'Smith, Sam')
  })

  it('A user can view list of incoming movements from custody suites', () => {
    cy.signIn()
    const incomingMovementsPage = Page.verifyOnPage(IncomingMovementsPage)
    incomingMovementsPage.incomingMovementsFromCustodySuite(1).should('contain.text', 'Prisoner, Mark')
    incomingMovementsPage.incomingMovementsFromCustodySuite(2).should('contain.text', 'Smith, Barry')
    incomingMovementsPage.incomingMovementsFromCustodySuite(3).should('contain.text', 'Smith, Bob')
  })

  it('A user can view list of incoming movements from another establishement', () => {
    cy.signIn()
    const incomingMovementsPage = Page.verifyOnPage(IncomingMovementsPage)
    incomingMovementsPage.incomingMovementsFromAnotherEstablishment(1).should('contain.text', 'Offender, Karl')
  })
})
