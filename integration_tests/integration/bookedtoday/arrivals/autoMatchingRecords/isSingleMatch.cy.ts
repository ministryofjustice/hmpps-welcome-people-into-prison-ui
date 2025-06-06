import Page from '../../../../pages/page'
import SingleMatchingRecordFoundPage from '../../../../pages/bookedtoday/arrivals/autoMatchingRecords/singleMatchingRecordFound'
import ImprisonmentStatusPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/imprisonmentStatus'
import CheckAnswersPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/checkAnswers'
import ConfirmAddedToRollPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/confirmAddedToRoll'
import Role from '../../../../../server/authentication/role'
import expectedArrivals from '../../../../mockApis/responses/expectedArrivals'
import ChoosePrisonerPage from '../../../../pages/bookedtoday/choosePrisoner'
import MovementReasonsPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/movementReasons'
import SearchForExistingPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/search/searchForExisting'
import ReviewDetailsPage from '../../../../pages/bookedtoday/arrivals/reviewDetails'
import PrisonerSummaryWithRecordPage from '../../../../pages/bookedtoday/prisonerSummaryWithRecord'
import bodyScans from '../../../../mockApis/responses/bodyScans'

const expectedArrival = expectedArrivals.arrival({
  fromLocationType: 'COURT',
  isCurrentPrisoner: false,
  gender: null,
  potentialMatches: [expectedArrivals.potentialMatch],
})
const prisonRecordDetails = expectedArrival.potentialMatches[0]

context('Is Single Match', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', [Role.PRISON_RECEPTION, Role.ROLE_INACTIVE_BOOKINGS])
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [expectedArrival] })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [] })
    cy.task('stubMissingPrisonerImage')
    cy.task('stubPrison', 'MDI')
    cy.task('stubImprisonmentStatus')
    cy.task('stubRetrieveMultipleBodyScans', [])
    cy.task('stubPrisonerDetails', { ...prisonRecordDetails, arrivalType: 'NEW_BOOKING' })
    cy.task('stubGetBodyScan', bodyScans.doNotScan())
  })

  it('Can confirm single record match', () => {
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()

    const prisonerSummaryWithRecordPage = new PrisonerSummaryWithRecordPage(
      `${expectedArrival.lastName}, ${expectedArrival.firstName}`
    )
    prisonerSummaryWithRecordPage.checkOnPage()
    prisonerSummaryWithRecordPage.breadcrumbs().should('exist')
    prisonerSummaryWithRecordPage.prisonerProfile().should('exist')
    prisonerSummaryWithRecordPage.confirmArrival().click()

    const singleMatchingRecordFoundPage = Page.verifyOnPage(SingleMatchingRecordFoundPage)
    singleMatchingRecordFoundPage.backNavigation().should('exist')
    singleMatchingRecordFoundPage.prisonerSplitView.contains(expectedArrival, prisonRecordDetails)
    singleMatchingRecordFoundPage.continue().click()

    const imprisonmentStatusPage = Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.backNavigation().should('exist')
    imprisonmentStatusPage.continue().click()
    imprisonmentStatusPage.hasError('Select why this person is in prison')
    imprisonmentStatusPage.imprisonmentStatusRadioButton('determinate-sentence').click()
    imprisonmentStatusPage.continue().click()

    const movementReasonPage = Page.verifyOnPage(MovementReasonsPage)
    movementReasonPage.continue().click()
    movementReasonPage.hasError('Select the type of fixed-length sentence')
    movementReasonPage.movementReasonRadioButton('26').click()
    movementReasonPage.continue().click()

    const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage)
    checkAnswersPage.checkDetails({
      name: 'Sam Smith',
      dob: '1 February 1970',
      prisonNumber: 'A1234BC',
      pncNumber: '01/4567A',
      sex: 'Male',
      reason: 'Sentenced - fixed length of time - Extended sentence for public protection',
    })
    cy.task('stubCreateOffenderRecordAndBooking', { arrivalId: expectedArrival.id })
    checkAnswersPage.addToRoll().click()

    const confirmAddedToRollPage = Page.verifyOnPage(ConfirmAddedToRollPage)
    confirmAddedToRollPage.checkDetails({
      name: 'Sam Smith',
      prison: 'Moorland (HMP & YOI)',
      prisonNumber: 'A1234BC',
      locationName: 'Reception',
    })
    confirmAddedToRollPage.addCaseNote('A1234BC').exists()
    confirmAddedToRollPage.viewEstablishmentRoll().exists()
    confirmAddedToRollPage.addAnotherToRoll().click()

    Page.verifyOnPage(ChoosePrisonerPage)

    cy.task('getConfirmationRequest', expectedArrival.id).then(request => {
      expect(request).to.deep.equal({
        dateOfBirth: '1970-02-01',
        firstName: 'Sam',
        sex: 'M',
        imprisonmentStatus: 'SENT',
        lastName: 'Smith',
        movementReasonCode: '26',
        prisonId: 'MDI',
        prisonNumber: 'A1234BC',
        fromLocationId: 'MDI',
      })
    })
  })

  it('A non reception user cannot confirm a booking or view prisoner profile', () => {
    cy.task('stubSignIn', [Role.ROLE_INACTIVE_BOOKINGS, Role.GLOBAL_SEARCH])
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()

    ChoosePrisonerPage.goTo().arrivalFrom('COURT')(1).confirm().click()
    const prisonerSummaryWithRecordPage = new PrisonerSummaryWithRecordPage(
      `${expectedArrival.lastName}, ${expectedArrival.firstName}`
    )
    prisonerSummaryWithRecordPage.breadcrumbs().should('exist')
    prisonerSummaryWithRecordPage.prisonerProfile().should('not.exist')
    prisonerSummaryWithRecordPage.confirmArrival().should('not.exist')
  })

  it('Should allow navigation to search for alternative', () => {
    expectedArrival.prisonNumber = null
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()

    const prisonerSummaryWithRecordPage = new PrisonerSummaryWithRecordPage(
      `${expectedArrival.lastName}, ${expectedArrival.firstName}`
    )
    prisonerSummaryWithRecordPage.checkOnPage()
    prisonerSummaryWithRecordPage.confirmArrival().click()

    const singleMatchingRecordFoundPage = Page.verifyOnPage(SingleMatchingRecordFoundPage)
    singleMatchingRecordFoundPage.search().click()

    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.name.value().should('contain.text', 'Bob Smith')
  })

  it('Should allow navigation to create a new record', () => {
    expectedArrival.prisonNumber = null
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()

    const prisonerSummaryWithRecordPage = new PrisonerSummaryWithRecordPage(
      `${expectedArrival.lastName}, ${expectedArrival.firstName}`
    )
    prisonerSummaryWithRecordPage.checkOnPage()
    prisonerSummaryWithRecordPage.confirmArrival().click()

    const singleMatchingRecordFoundPage = Page.verifyOnPage(SingleMatchingRecordFoundPage)
    singleMatchingRecordFoundPage.createNew().click()

    const reviewDetailsPage = Page.verifyOnPage(ReviewDetailsPage)
    reviewDetailsPage.name.value().should('contain.text', 'Bob Smith')
  })

  it('Back link navigation', () => {
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()

    const prisonerSummaryWithRecordPage = new PrisonerSummaryWithRecordPage(
      `${expectedArrival.lastName}, ${expectedArrival.firstName}`
    )
    prisonerSummaryWithRecordPage.checkOnPage()
    prisonerSummaryWithRecordPage.confirmArrival().click()

    const singleMatchingRecordFoundPage = Page.verifyOnPage(SingleMatchingRecordFoundPage)
    singleMatchingRecordFoundPage.continue().click()

    const imprisonmentStatusPage = Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage)
    checkAnswersPage.backNavigation().click()

    Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.backNavigation().click()

    Page.verifyOnPage(SingleMatchingRecordFoundPage)
    singleMatchingRecordFoundPage.continue().click()

    Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    Page.verifyOnPage(CheckAnswersPage)
    cy.task('stubCreateOffenderRecordAndBooking', { arrivalId: expectedArrival.id })
    checkAnswersPage.addToRoll().click()

    const confirmAddedToRollPage = Page.verifyOnPage(ConfirmAddedToRollPage)
    confirmAddedToRollPage.backNavigation().should('not.exist')
  })
})
