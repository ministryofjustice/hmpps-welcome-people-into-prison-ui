import Page from '../pages/page'
import ImprisonmentStatusPage from '../pages/imprisonmentStatus'
import MovementReasonsPage from '../pages/movementReasons'
import CheckAnswersPage from '../pages/checkAnswers'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'

const expectedArrival = expectedArrivals.court.notCurrent

context('Imprisonment status', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubExpectedArrival', expectedArrival)
    cy.task('stubImprisonmentStatus')
  })

  it("Should display prisoner's name", () => {
    cy.signIn()
    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
    imprisonmentStatusPage.prisonerName().should('contain.text', 'Sam Smith')
  })

  it('Selecting an option with a single movement reason takes user straight through to check answers', () => {
    cy.signIn()
    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
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
    imprisonmentStatusPage.errorSummaryTitle().contains('There is a problem')
    imprisonmentStatusPage.errorSummaryBody().contains('Select a reason for imprisonment')
    imprisonmentStatusPage.errorSummaryMessage().contains('Select a reason for imprisonment')
  })
})
