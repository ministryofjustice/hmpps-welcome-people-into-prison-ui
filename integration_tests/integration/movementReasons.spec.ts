import Page from '../pages/page'
import MovementReasonsPage from '../pages/movementReasons'
import CheckAnswersPage from '../pages/checkAnswers'
import Role from '../../server/authentication/role'

const expectedArrival = {
  id: '00000-11111',
  firstName: 'Harry',
  lastName: 'Stanton',
  dateOfBirth: '1961-01-29',
  prisonNumber: 'A1234AB',
  pncNumber: '01/3456A',
  date: '2021-09-01',
  fromLocation: 'Reading',
  fromLocationType: 'COURT',
}
context('Movement reasons', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubAuthUser')
    cy.task('stubExpectedArrivals', 'MDI')
    cy.task('stubExpectedArrival', expectedArrival)
    cy.task('stubImprisonmentStatus')
  })

  it("Should display prisoner's name", () => {
    cy.signIn()
    const movementReasonsPage = MovementReasonsPage.goTo(expectedArrival.id, 'civil-offence')
    movementReasonsPage.prisonerName().should('contain.text', 'Harry Stanton')
  })

  it('Selecting an option takes user through to check answers', () => {
    cy.signIn()
    const movementReasonsPage = MovementReasonsPage.goTo(expectedArrival.id, 'civil-offence')
    movementReasonsPage.movementReasonRadioButton('C').click()
    movementReasonsPage.continue().click()
    Page.verifyOnPage(CheckAnswersPage)
  })

  it('Should display validation error if no imprisonment status selected', () => {
    cy.signIn()
    const movementReasonsPage = MovementReasonsPage.goTo(expectedArrival.id, 'civil-offence')
    movementReasonsPage.continue().click()
    movementReasonsPage.errorSummaryTitle().contains('There is a problem')
    movementReasonsPage.errorSummaryBody().contains('Select the civil offence')
    movementReasonsPage.errorSummaryMessage().contains('Select the civil offence')
  })
})
