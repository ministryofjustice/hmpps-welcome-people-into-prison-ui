import Page from '../../../pages/page'
import MovementReasonsPage from '../../../pages/bookedtoday/arrivals/movementReasons'
import CheckAnswersPage from '../../../pages/bookedtoday/arrivals/checkAnswers'
import Role from '../../../../server/authentication/role'
import expectedArrivals from '../../../mockApis/responses/expectedArrivals'
import SexPage from '../../../pages/bookedtoday/arrivals/sexPage'

context('Movement reasons', () => {
  const expectedArrival = expectedArrivals.withFemaleGender

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubExpectedArrival', expectedArrival)
    cy.task('stubImprisonmentStatus')
  })

  it("Should display prisoner's name", () => {
    cy.signIn()
    const movementReasonsPage = MovementReasonsPage.goTo(expectedArrival.id, 'civil-offence')
    movementReasonsPage.prisonerName().should('contain.text', 'Steve Smith')
  })

  it('Selecting an option takes user through to check answers', () => {
    cy.signIn()
    SexPage.goToWithRedirect(expectedArrival.id)
    const movementReasonsPage = MovementReasonsPage.goTo(expectedArrival.id, 'civil-offence')
    movementReasonsPage.movementReasonRadioButton('C').click()
    movementReasonsPage.continue().click()
    Page.verifyOnPage(CheckAnswersPage)
  })

  it('Should display validation error if no imprisonment status selected', () => {
    cy.signIn()
    const movementReasonsPage = MovementReasonsPage.goTo(expectedArrival.id, 'civil-offence')
    movementReasonsPage.continue().click()
    movementReasonsPage.hasError('Select the civil offence')
  })
})
