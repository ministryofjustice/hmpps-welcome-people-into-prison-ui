import Page from '../pages/page'
import FeatureNotAvailable from '../pages/featureNotAvailable'
import ImprisonmentStatusPage from '../pages/bookedtoday/arrivals/confirmArrival/imprisonmentStatus'
import CheckAnswersPage from '../pages/bookedtoday/arrivals/confirmArrival/checkAnswers'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'
import ChoosePrisonerPage from '../pages/bookedtoday/choosePrisoner'
import SingleMatchingRecordFoundPage from '../pages/bookedtoday/arrivals/autoMatchingRecords/singleMatchingRecordFound'

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

  it('Should display feature-not-available page when client error during confirmation', () => {
    const expectedArrival = expectedArrivals.arrival({
      fromLocationType: 'COURT',
      isCurrentPrisoner: false,
      potentialMatches: [expectedArrivals.potentialMatch],
    })
    cy.task('stubExpectedArrival', expectedArrival)
    cy.task('stubCreateOffenderRecordAndBookingReturnsError', { arrivalId: expectedArrival.id, status: 400 })

    cy.signIn()

    const singleMatchingRecordFoundPage = ChoosePrisonerPage.selectPrisoner(
      expectedArrival.id,
      SingleMatchingRecordFoundPage
    )
    singleMatchingRecordFoundPage.continue().click()

    const imprisonmentStatusPage = Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage)

    checkAnswersPage.addToRoll().click()
    Page.verifyOnPage(FeatureNotAvailable)
  })
})
