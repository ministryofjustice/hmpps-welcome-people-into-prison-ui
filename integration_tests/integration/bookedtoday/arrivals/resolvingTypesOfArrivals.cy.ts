import ChoosePrisonerPage from '../../../pages/bookedtoday/choosePrisoner'
import Page from '../../../pages/page'
import Role from '../../../../server/authentication/role'
import expectedArrivals from '../../../mockApis/responses/expectedArrivals'
import MultipleMatchingRecordsPage from '../../../pages/bookedtoday/arrivals/autoMatchingRecords/multipleMatchingRecordsFound'
import CheckTemporaryAbsencePage from '../../../pages/temporaryabsences/checkTemporaryAbsence'
import ConfirmTemporaryAbsenceAddedToRollPage from '../../../pages/temporaryabsences/confirmTemporaryAbsenceAddedToRoll'
import CheckTransferPage from '../../../pages/bookedtoday/transfers/checkTransfer'
import ConfirmTransferAddedToRollPage from '../../../pages/bookedtoday/transfers/confirmTransferAddedToRoll'
import CheckCourtReturnPage from '../../../pages/bookedtoday/arrivals/courtreturns/checkCourtReturn'
import ConfirmCourtReturnAddedToRollPage from '../../../pages/bookedtoday/arrivals/courtreturns/confirmCourtReturnAddedToRoll'
import FeatureNotAvailablePage from '../../../pages/featureNotAvailable'
import PrisonerSummaryWithRecordPage from '../../../pages/bookedtoday/prisonerSummaryWithRecord'

const arrival = expectedArrivals.arrival({
  fromLocationType: 'COURT',
  isCurrentPrisoner: false,
  dateOfBirth: '1972-02-01',
  pncNumber: '01/4567A',
  prisonNumber: 'A1234BD',
  potentialMatches: [
    {
      firstName: 'Sam',
      lastName: 'Smoth',
      dateOfBirth: '1971-02-02',
      prisonNumber: 'A1234BB',
      pncNumber: '01/4567A',
      croNumber: '01/0000A',
      sex: 'MALE',
    },
    {
      id: '11111-11111',
      firstName: 'Sum',
      lastName: 'Smoth',
      dateOfBirth: '1971-02-03',
      prisonNumber: 'A1234BD',
      pncNumber: '01/4567B',
      croNumber: '02/0000A',
      sex: 'MALE',
    },
  ],
})
const chosenMatch = arrival.potentialMatches[1]

context('Redirect logic once a record for an arrival has been resolved', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', [Role.PRISON_RECEPTION])
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [] })
    cy.task('stubMissingPrisonerImage')
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [arrival] })
    cy.task('stubExpectedArrival', arrival)
    cy.task('stubImprisonmentStatus')
    cy.task('stubPrisonerDetails', { ...arrival.potentialMatches[1], arrivalType: 'NEW_BOOKING' })
    cy.task('stubRetrieveMultipleBodyScans', [])
    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()
    const prisonerSummaryWithRecordPage = new PrisonerSummaryWithRecordPage(`${arrival.lastName}, ${arrival.firstName}`)
    prisonerSummaryWithRecordPage.checkOnPage()
    prisonerSummaryWithRecordPage.confirmArrival().click()
  })

  it('Can choose and confirm arrival of a temporay absence', () => {
    cy.task('stubPrisonerDetails', { ...chosenMatch, arrivalType: 'FROM_TEMPORARY_ABSENCE' })
    cy.task('stubTemporaryAbsence', {
      activeCaseLoadId: 'MDI',
      prisonNumber: chosenMatch.prisonNumber,
      temporaryAbsence: chosenMatch,
    })
    cy.task('stubConfirmTemporaryAbsence', chosenMatch.prisonNumber)

    const multipleMatchingRecordsPage = Page.verifyOnPage(MultipleMatchingRecordsPage)
    multipleMatchingRecordsPage.match(2).select().click()
    multipleMatchingRecordsPage.continue().click()

    const checkTemporaryAbsencePage = Page.verifyOnPage(CheckTemporaryAbsencePage)
    checkTemporaryAbsencePage.addToRoll().click()
    Page.verifyOnPage(ConfirmTemporaryAbsenceAddedToRollPage)

    cy.task('getTemporaryAbsenceConfirmationRequest', arrival.prisonNumber).then(request => {
      expect(request).to.deep.equal({ prisonId: 'MDI', arrivalId: chosenMatch.id })
    })
  })

  it('Can choose and confirm arrival of a transfer', () => {
    cy.task('stubPrisonerDetails', { ...chosenMatch, arrivalType: 'TRANSFER' })
    cy.task('stubTransfer', {
      caseLoadId: 'MDI',
      prisonNumber: chosenMatch.prisonNumber,
      transfer: chosenMatch,
    })
    cy.task('stubConfirmTransfer', chosenMatch.prisonNumber)

    const multipleMatchingRecordsPage = Page.verifyOnPage(MultipleMatchingRecordsPage)
    multipleMatchingRecordsPage.match(2).select().click()
    multipleMatchingRecordsPage.continue().click()

    const checkTransferPage = Page.verifyOnPage(CheckTransferPage)
    checkTransferPage.addToRoll().click()

    Page.verifyOnPage(ConfirmTransferAddedToRollPage)

    cy.task('getTransferConfirmationRequest', chosenMatch.prisonNumber).then(request => {
      expect(request).to.deep.equal({ prisonId: 'MDI', arrivalId: chosenMatch.id })
    })
  })

  /**
   * Will need to handle this properly - problem is we show details about the matched prisoner for court return
   * This should show chosen prisoner instead.
   */
  it.skip('Can choose and confirm arrival of a court transfer', () => {
    cy.task('stubPrisonerDetails', { ...chosenMatch, arrivalType: 'FROM_COURT' })
    cy.task('stubConfirmCourtReturn', chosenMatch.id)

    const multipleMatchingRecordsPage = Page.verifyOnPage(MultipleMatchingRecordsPage)
    multipleMatchingRecordsPage.match(2).select().click()
    multipleMatchingRecordsPage.continue().click()

    const checkCourtReturnPage = Page.verifyOnPage(CheckCourtReturnPage)
    checkCourtReturnPage.addToRoll().click()

    Page.verifyOnPage(ConfirmCourtReturnAddedToRollPage)

    cy.task('getCourtReturnConfirmationRequest', chosenMatch.id).then(request => {
      expect(request).to.deep.equal({ prisonId: 'MDI', prisonNumber: 'A1234BC' })
    })
  })

  it('Cannot choose and confirm arrival of an unknown type', () => {
    cy.task('stubPrisonerDetails', { ...chosenMatch, arrivalType: 'UNKNOWN' })

    const multipleMatchingRecordsPage = Page.verifyOnPage(MultipleMatchingRecordsPage)
    multipleMatchingRecordsPage.match(2).select().click()
    multipleMatchingRecordsPage.continue().click()

    Page.verifyOnPage(FeatureNotAvailablePage)
  })
})
