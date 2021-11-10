import Page from '../pages/page'
import ImprisonmentStatusPage from '../pages/imprisonmentStatus'
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
context('Imprisonment status', () => {
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
    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
    imprisonmentStatusPage.prisonerName().should('contain.text', 'Harry Stanton')
  })

  it('Selecting an option with a single movement reason takes user straight through to check answers', () => {
    cy.signIn()
    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
    imprisonmentStatusPage.imprisonmentStatusSingleReasonRadioButton().click()
    imprisonmentStatusPage.continue().click()
    Page.verifyOnPage(CheckAnswersPage)
  })

  it('Selecting an option with multiple movement reasons takes user to the movement reasons page', () => {
    cy.signIn()
    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
    imprisonmentStatusPage.imprisonmentStatusMultipleReasonRadioButton().click()
    imprisonmentStatusPage.continue().click()
    Page.verifyOnPage(MovementReasonsPage)
  })

  it('Should display validation error if no imprisonment status selected', () => {
    cy.signIn()
    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
    imprisonmentStatusPage.continue().click()
    imprisonmentStatusPage.errorSummaryTitle().contains('There is a problem')
    imprisonmentStatusPage.errorSummaryBody().contains('Select a reason for imprisonment')
    imprisonmentStatusPage.errorSummaryMessage().contains('Select a reason for imprisonment')
  })
})
