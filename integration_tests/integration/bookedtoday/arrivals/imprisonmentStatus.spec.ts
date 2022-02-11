import Page from '../../../pages/page'
import ImprisonmentStatusPage from '../../../pages/bookedtoday/arrivals/imprisonmentStatus'
import MovementReasonsPage from '../../../pages/bookedtoday/arrivals/movementReasons'
import CheckAnswersPage from '../../../pages/bookedtoday/arrivals/checkAnswers'
import Role from '../../../../server/authentication/role'
import expectedArrivals from '../../../mockApis/responses/expectedArrivals'
import SexPage from '../../../pages/bookedtoday/arrivals/sexPage'

const expectedArrival = expectedArrivals.withFemaleGender

context('Imprisonment status', () => {
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
    const imprisonmentStatusPage = SexPage.goToWithRedirect(expectedArrival.id)
    imprisonmentStatusPage.prisonerName().should('contain.text', 'Steve Smith')
  })

  it('Selecting an option with a single movement reason takes user straight through to check answers', () => {
    cy.signIn()
    const imprisonmentStatusPage = SexPage.goToWithRedirect(expectedArrival.id)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()
    Page.verifyOnPage(CheckAnswersPage)
  })

  it('Selecting an option with multiple movement reasons takes user to the movement reasons page', () => {
    cy.signIn()
    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('determinate-sentence').click()
    imprisonmentStatusPage.continue().click()
    Page.verifyOnPage(MovementReasonsPage)
  })

  it('Should display validation error if no imprisonment status selected', () => {
    cy.signIn()
    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
    imprisonmentStatusPage.continue().click()
    imprisonmentStatusPage.hasError('Select a reason for imprisonment')
  })
})
