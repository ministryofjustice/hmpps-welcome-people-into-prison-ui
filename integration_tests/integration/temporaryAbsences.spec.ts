import TemporaryAbsencesPage from '../pages/temporaryAbsences'

context('A user can view all current temporary absences', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubExpectedArrivals', 'MDI')
    cy.task('stubTemporaryAbsences', 'MDI')
  })

  it('A user can view list of temporary absences', () => {
    cy.signIn()
    const temporaryAbsencesPage = TemporaryAbsencesPage.goTo()
    temporaryAbsencesPage.temporaryAbsences(1).should('contain.text', 'Doe, John')
    temporaryAbsencesPage.temporaryAbsences(2).should('contain.text', 'Offender, Karl')
  })
})
