import Page from '../pages/page'
import FeatureNotAvailable from '../pages/featureNotAvailable'
import ExistingRecordPage from '../pages/bookedtoday/arrivals/existingRecord'
import ImprisonmentStatusPage from '../pages/bookedtoday/arrivals/imprisonmentStatus'
import CheckAnswersPage from '../pages/bookedtoday/arrivals/checkAnswers'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'

context('Feature not available', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubMissingPrisonerImage')
    cy.task('stubPrison', 'MDI')
    cy.task('stubImprisonmentStatus')
  })

  it('Should display feature-not-available page', () => {
    const expectedArrival = expectedArrivals.arrival({
      fromLocationType: 'COURT',
      isCurrentPrisoner: false,
      potentialMatches: [expectedArrivals.potentialMatch],
    })
    cy.task('stubExpectedArrival', expectedArrival)
    cy.task('stubCreateOffenderRecordAndBookingReturnsError', { arrivalId: expectedArrival.id, status: 400 })

    cy.signIn()

    ExistingRecordPage.goTo(expectedArrival.id).continue().click()

    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    const checkAnswersPage = CheckAnswersPage.goTo(expectedArrival.id)

    checkAnswersPage.addToRoll().click()
    Page.verifyOnPage(FeatureNotAvailable)
  })
})
