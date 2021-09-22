import TemporaryAbsencesPage from '../pages/temporaryAbsences'
import Page from '../pages/page'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubIncomingMovements', 'MDI')
    cy.task('stubTemporaryAbsences', 'MDI')
  })

  it('A user can view list of temporary absences', () => {
    cy.signIn()
    cy.visit('/confirm-arrival/return-from-temporary-absence')
    const temporaryAbsencesPage = Page.verifyOnPage(TemporaryAbsencesPage)
    temporaryAbsencesPage.temporaryAbsences(1).should('contain.text', 'Doe, John')
    temporaryAbsencesPage.temporaryAbsences(2).should('contain.text', 'Offender, Karl')
  })
})
