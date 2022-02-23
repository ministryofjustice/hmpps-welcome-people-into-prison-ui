import Page from '../pages/page'
import FeatureNotAvailable from '../pages/featureNotAvailable'
import ImprisonmentStatusPage from '../pages/bookedtoday/arrivals/imprisonmentStatus'
import CheckAnswersPage from '../pages/bookedtoday/arrivals/checkAnswers'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'
import ChoosePrisonerPage from '../pages/bookedtoday/choosePrisoner'
import SingleRecordFoundPage from '../pages/bookedtoday/arrivals/singleRecordFound'

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

    const singleRecordFound = ChoosePrisonerPage.selectPrisoner(expectedArrival.id, SingleRecordFoundPage)
    singleRecordFound.continue().click()

    const imprisonmentStatusPage = Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    const checkAnswersPage = CheckAnswersPage.goTo(expectedArrival.id)

    checkAnswersPage.addToRoll().click()
    Page.verifyOnPage(FeatureNotAvailable)
  })
})
