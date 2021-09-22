import ChoosePrisonerPage from '../pages/choosePrisoner'
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
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)
    choosePrisonerPage.incomingMovementsFromCourt(1).should('contain.text', 'Doe, John')
    choosePrisonerPage.incomingMovementsFromCourt(2).should('contain.text', 'Smith, Sam')
  })

  it('A user can view list of incoming movements from custody suites', () => {
    cy.signIn()
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)
    choosePrisonerPage.incomingMovementsFromCustodySuite(1).should('contain.text', 'Prisoner, Mark')
    choosePrisonerPage.incomingMovementsFromCustodySuite(2).should('contain.text', 'Smith, Barry')
    choosePrisonerPage.incomingMovementsFromCustodySuite(3).should('contain.text', 'Smith, Bob')
  })

  it('A user can view list of incoming movements from another establishement', () => {
    cy.signIn()
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)
    choosePrisonerPage.incomingMovementsFromAnotherEstablishment(1).should('contain.text', 'Offender, Karl')
  })
})
