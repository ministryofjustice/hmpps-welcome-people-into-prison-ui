import Page from '../pages/page'
import FeatureNotAvailable from '../pages/featureNotAvailable'
import ImprisonmentStatusPage from '../pages/bookedtoday/arrivals/confirmArrival/imprisonmentStatus'
import CheckAnswersPage from '../pages/bookedtoday/arrivals/confirmArrival/checkAnswers'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'
import ChoosePrisonerPage from '../pages/bookedtoday/choosePrisoner'
import SingleMatchingRecordFoundPage from '../pages/bookedtoday/arrivals/autoMatchingRecords/singleMatchingRecordFound'
import CheckCourtReturnPage from '../pages/bookedtoday/arrivals/courtreturns/checkCourtReturn'
import CheckTransferPage from '../pages/bookedtoday/transfers/checkTransfer'
import temporaryAbsences from '../mockApis/responses/temporaryAbsences'
import TemporaryAbsencePage from '../pages/temporaryabsences/temporaryAbsences'
import CheckTemporaryAbsencePage from '../pages/temporaryabsences/checkTemporaryAbsence'

context('Feature not available', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubMissingPrisonerImage')
    cy.task('stubPrison', 'MDI')
    cy.task('stubImprisonmentStatus')
    cy.task('stubGetBodyScanInfo', [])
  })

  it('Should display feature-not-available page when client error during confirmation of new prisoner from court', () => {
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
  it('Should display feature-not-available page when client error during confirmation of court return of existing prisoner', () => {
    const expectedArrival = expectedArrivals.court.current
    const prisonRecordDetails = expectedArrival.potentialMatches[0]

    cy.task('stubConfirmCourtReturnsError', { arrivalId: expectedArrival.id, status: 404 })
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()

    const checkCourtReturnPage = ChoosePrisonerPage.selectPrisoner(expectedArrival.id, CheckCourtReturnPage)
    checkCourtReturnPage.prisonerSplitView.contains(expectedArrival, prisonRecordDetails)
    checkCourtReturnPage.addToRoll().click()
    Page.verifyOnPage(FeatureNotAvailable)
  })

  it('Should display feature-not-available page when client error during prison transfer', () => {
    const expectedArrival = expectedArrivals.prisonTransfer

    cy.task('stubExpectedArrivals', {
      caseLoadId: 'MDI',
      arrivals: [],
    })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [expectedArrival] })
    cy.task('stubTransfer', {
      caseLoadId: 'MDI',
      prisonNumber: expectedArrival.prisonNumber,
      transfer: expectedArrival,
    })
    cy.task('stubConfirmTransferReturnsError', { arrivalId: expectedArrival.prisonNumber, status: 404 })
    cy.signIn()

    ChoosePrisonerPage.goTo().arrivalFrom('PRISON')(1).confirm().click()
    const checkTransferPage = Page.verifyOnPage(CheckTransferPage)
    checkTransferPage.addToRoll().click()
    Page.verifyOnPage(FeatureNotAvailable)
  })

  it('Should display feature-not-available page when client error during temp absence', () => {
    cy.task('stubTemporaryAbsences', 'MDI')
    cy.task('stubTemporaryAbsence', {
      activeCaseLoadId: 'MDI',
      prisonNumber: temporaryAbsences[0].prisonNumber,
      temporaryAbsence: temporaryAbsences[0],
    })
    cy.task('stubConfirmTemporaryAbsenceReturnsError', { prisonNumber: temporaryAbsences[0].prisonNumber, status: 404 })
    cy.signIn()

    const temporaryAbsencePage = TemporaryAbsencePage.goTo()
    temporaryAbsencePage.temporaryAbsences(1).confirm().click()
    const checkTemporaryAbsencePage = Page.verifyOnPage(CheckTemporaryAbsencePage)
    checkTemporaryAbsencePage.addToRoll().click()
    Page.verifyOnPage(FeatureNotAvailable)
  })
})
