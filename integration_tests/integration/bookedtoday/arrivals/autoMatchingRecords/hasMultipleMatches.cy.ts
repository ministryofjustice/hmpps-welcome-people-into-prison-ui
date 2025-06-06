import ChoosePrisonerPage from '../../../../pages/bookedtoday/choosePrisoner'
import Page from '../../../../pages/page'
import Role from '../../../../../server/authentication/role'
import expectedArrivals from '../../../../mockApis/responses/expectedArrivals'
import MultipleMatchingRecordsPage from '../../../../pages/bookedtoday/arrivals/autoMatchingRecords/multipleMatchingRecordsFound'
import ImprisonmentStatusPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/imprisonmentStatus'
import MovementReasonsPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/movementReasons'
import CheckAnswersPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/checkAnswers'
import ConfirmAddedToRollPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/confirmAddedToRoll'
import SearchForExistingPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/search/searchForExisting'
import ReviewDetailsPage from '../../../../pages/bookedtoday/arrivals/reviewDetails'
import PrisonerSummaryMoveOnlyPage from '../../../../pages/bookedtoday/prisonerSummaryMoveOnly'

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

context('Arrival matches multiple records', () => {
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
  })

  it('Can choose and confirm arrival', () => {
    const prisonerSummaryMoveOnlyPage = new PrisonerSummaryMoveOnlyPage(`${arrival.lastName}, ${arrival.firstName}`)
    prisonerSummaryMoveOnlyPage.checkOnPage()
    prisonerSummaryMoveOnlyPage.breadcrumbs().should('exist')
    prisonerSummaryMoveOnlyPage.confirmArrival().click()

    const multipleMatchingRecordsPage = Page.verifyOnPage(MultipleMatchingRecordsPage)
    const personalDetails = multipleMatchingRecordsPage.arrival()
    personalDetails.fieldName('prisoner-name').should('contain', 'Bob Smith')
    personalDetails.fieldName('dob').should('contain', '1 February 1972')
    personalDetails.fieldName('prison-number').should('contain', arrival.prisonNumber)
    personalDetails.fieldName('pnc-number').should('contain', arrival.pncNumber)

    {
      const match = multipleMatchingRecordsPage.match(1)
      match.fieldName('prisoner-name').should('contain', 'Sam Smoth')
      match.fieldName('dob').should('contain', '2 February 1971')
      match.fieldName('prison-number').should('contain', arrival.potentialMatches[0].prisonNumber)
      match.fieldName('pnc-number').should('contain', arrival.potentialMatches[0].pncNumber)
      match.fieldName('cro-number').should('contain', arrival.potentialMatches[0].croNumber)
      match.prisonerImage.check({
        href: `/prisoners/${arrival.potentialMatches[0].prisonNumber}/image`,
        alt: 'Smoth, Sam',
      })
    }
    {
      const match = multipleMatchingRecordsPage.match(2)
      match.fieldName('prisoner-name').should('contain', 'Sum Smoth')
      match.fieldName('dob').should('contain', '3 February 1971')
      match.fieldName('prison-number').should('contain', arrival.potentialMatches[1].prisonNumber)
      match.fieldName('pnc-number').should('contain', arrival.potentialMatches[1].pncNumber)
      match.fieldName('cro-number').should('contain', arrival.potentialMatches[1].croNumber)
      match.prisonerImage.check({
        href: `/prisoners/${arrival.potentialMatches[1].prisonNumber}/image`,
        alt: 'Smoth, Sum',
      })
    }

    multipleMatchingRecordsPage.continue().click()
    multipleMatchingRecordsPage.hasError('Select an existing record or search using different details')

    multipleMatchingRecordsPage.match(2).select().click()
    multipleMatchingRecordsPage.continue().click()

    const imprisonmentStatusPage = Page.verifyOnPage(ImprisonmentStatusPage)
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
      name: 'Sum Smoth',
      dob: '3 February 1971',
      prisonNumber: arrival.potentialMatches[1].prisonNumber,
      pncNumber: arrival.potentialMatches[1].pncNumber,
      sex: 'Male',
      reason: 'Sentenced - fixed length of time - Extended sentence for public protection',
    })
    cy.task('stubCreateOffenderRecordAndBooking', {
      arrivalId: arrival.id,
      prisonNumber: arrival.potentialMatches[1].prisonNumber,
    })
    checkAnswersPage.addToRoll().click()

    const confirmAddedToRollPage = Page.verifyOnPage(ConfirmAddedToRollPage)
    confirmAddedToRollPage.checkDetails({
      name: 'Sum Smoth',
      prison: 'Moorland (HMP & YOI)',
      prisonNumber: arrival.potentialMatches[1].prisonNumber,
      locationName: 'Reception',
    })
    confirmAddedToRollPage.addCaseNote(arrival.potentialMatches[1].prisonNumber).exists()
    confirmAddedToRollPage.updatePersonalDetails(arrival.potentialMatches[1].prisonNumber).exists()
    confirmAddedToRollPage.viewEstablishmentRoll().exists()
    confirmAddedToRollPage.addAnotherToRoll().click()

    Page.verifyOnPage(ChoosePrisonerPage)

    cy.task('getConfirmationRequest', arrival.id).then(request => {
      expect(request).to.deep.equal({
        dateOfBirth: '1971-02-03',
        firstName: 'Sum',
        sex: 'M',
        imprisonmentStatus: 'SENT',
        lastName: 'Smoth',
        movementReasonCode: '26',
        prisonId: 'MDI',
        prisonNumber: arrival.potentialMatches[1].prisonNumber,
        fromLocationId: 'MDI',
      })
    })
  })

  it('should allow searching with different details', () => {
    const prisonerSummaryMoveOnlyPage = new PrisonerSummaryMoveOnlyPage(`${arrival.lastName}, ${arrival.firstName}`)
    prisonerSummaryMoveOnlyPage.checkOnPage()
    prisonerSummaryMoveOnlyPage.breadcrumbs().should('exist')
    prisonerSummaryMoveOnlyPage.confirmArrival().click()

    const multipleMatchingRecordsPage = Page.verifyOnPage(MultipleMatchingRecordsPage)
    multipleMatchingRecordsPage.search().click()
    Page.verifyOnPage(SearchForExistingPage)
  })

  it('Should allow navigation to create a new record', () => {
    const prisonerSummaryMoveOnlyPage = new PrisonerSummaryMoveOnlyPage(`${arrival.lastName}, ${arrival.firstName}`)
    prisonerSummaryMoveOnlyPage.checkOnPage()
    prisonerSummaryMoveOnlyPage.breadcrumbs().should('exist')
    prisonerSummaryMoveOnlyPage.confirmArrival().click()

    const multipleMatchingRecordsPage = Page.verifyOnPage(MultipleMatchingRecordsPage)
    multipleMatchingRecordsPage.createNewDetailsReveal().click()
    multipleMatchingRecordsPage.createNew().click()

    const reviewDetailsPage = Page.verifyOnPage(ReviewDetailsPage)
    reviewDetailsPage.name.value().should('contain.text', 'Bob Smith')
  })
})
