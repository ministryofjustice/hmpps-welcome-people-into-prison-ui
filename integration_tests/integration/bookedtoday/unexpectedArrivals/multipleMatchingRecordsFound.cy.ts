import Page from '../../../pages/page'
import Role from '../../../../server/authentication/role'
import SearchForExistingPage from '../../../pages/bookedtoday/unexpectedArrivals/searchForExistingRecord'
import MultipleRecordsFoundPage from '../../../pages/bookedtoday/unexpectedArrivals/multipleRecordsFound'
import expectedArrivals from '../../../mockApis/responses/expectedArrivals'
import ImprisonmentStatusPage from '../../../pages/bookedtoday/arrivals/confirmArrival/imprisonmentStatus'
import MovementReasonsPage from '../../../pages/bookedtoday/arrivals/confirmArrival/movementReasons'
import ConfirmAddedToRollPage from '../../../pages/bookedtoday/arrivals/confirmArrival/confirmAddedToRoll'
import ChoosePrisonerPage from '../../../pages/bookedtoday/choosePrisoner'
import CheckAnswersPage from '../../../pages/bookedtoday/arrivals/confirmArrival/checkAnswers'

const arrival = expectedArrivals.arrival({
  fromLocationType: 'COURT',
  isCurrentPrisoner: false,
  dateOfBirth: '1972-02-01',
  pncNumber: '01/4567A',
  prisonNumber: 'A1234BD',
  potentialMatches: [
    {
      firstName: 'Bob',
      lastName: 'Smith',
      dateOfBirth: '1972-11-21',
      prisonNumber: 'G0014GM',
      pncNumber: '01/1111A',
      croNumber: '01/0000A',
      sex: 'MALE',
    },
    {
      firstName: 'Robert',
      lastName: 'Smyth',
      dateOfBirth: '1982-11-21',
      prisonNumber: 'G0014GM',
      pncNumber: '01/1111A',
      croNumber: '01/0000A',
      sex: 'MALE',
    },
  ],
})

context('Unexpected arrivals - multiple matching records', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubImprisonmentStatus')
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [] })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [] })
    cy.task('stubPrisonerDetails', { ...arrival.potentialMatches[0], arrivalType: 'NEW_BOOKING' })
    cy.task('stubRetrieveMultipleBodyScans', [])
    cy.signIn()

    SearchForExistingPage.goTo()
    cy.task('stubUnexpectedArrivalsMatchedRecords', arrival.potentialMatches)
  })

  it('should display page contents, errors and continue to next page', () => {
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.firstName().type('James')
    searchPage.lastName().type('Smith')
    searchPage.day().type('21')
    searchPage.month().type('11')
    searchPage.year().type('1972')
    searchPage.otherSearchDetails().click()
    searchPage.pncNumber().type('01/23456M')
    searchPage.prisonNumber().type('A1234AA')
    searchPage.search().click()
    const multipleRecordsFoundPage = Page.verifyOnPage(MultipleRecordsFoundPage)

    const personalDetails = multipleRecordsFoundPage.arrival()
    personalDetails.fieldName('prisoner-name').should('contain', 'James Smith')
    personalDetails.fieldName('dob').should('contain', '21 November 1972')
    personalDetails.fieldName('prison-number').should('contain', 'A1234AA')
    personalDetails.fieldName('pnc-number').should('contain', '01/23456M')

    {
      const match = multipleRecordsFoundPage.match(1)
      match.fieldName('prisoner-name').should('contain', 'Bob Smith')
      match.fieldName('dob').should('contain', '21 November 1972')
      match.fieldName('prison-number').should('contain', arrival.potentialMatches[0].prisonNumber)
      match.fieldName('pnc-number').should('contain', arrival.potentialMatches[0].pncNumber)
      match.fieldName('cro-number').should('contain', arrival.potentialMatches[0].croNumber)
    }

    {
      const match = multipleRecordsFoundPage.match(2)
      match.fieldName('prisoner-name').should('contain', 'Robert Smyth')
      match.fieldName('dob').should('contain', '21 November 1982')
      match.fieldName('prison-number').should('contain', arrival.potentialMatches[1].prisonNumber)
      match.fieldName('pnc-number').should('contain', arrival.potentialMatches[1].pncNumber)
      match.fieldName('cro-number').should('contain', arrival.potentialMatches[1].croNumber)
      match
        .prisonerImage()
        .check({ href: `/prisoners/${arrival.potentialMatches[1].prisonNumber}/image`, alt: 'Smyth, Robert' })
    }

    multipleRecordsFoundPage.continue().click()
    multipleRecordsFoundPage.hasError('Select an existing record or search using different details')

    multipleRecordsFoundPage.match(2).select().click()
    multipleRecordsFoundPage.continue().click()

    const imprisonmentStatusPage = Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('determinate-sentence').click()
    imprisonmentStatusPage.continue().click()

    const movementReasonPage = Page.verifyOnPage(MovementReasonsPage)
    movementReasonPage.movementReasonRadioButton('26').click()
    movementReasonPage.continue().click()

    const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage)
    checkAnswersPage.checkDetails({
      name: 'Bob Smith',
      dob: '21 November 1972',
      sex: 'Male',
      prisonNumber: 'G0014GM',
      pncNumber: '01/1111A',
      reason: 'Sentenced - fixed length of time - Extended sentence for public protection',
    })

    cy.task('stubConfirmUnexpectedArrval', {
      prisonNumber: arrival.potentialMatches[0].prisonNumber,
      location: 'Reception',
    })

    checkAnswersPage.addToRoll().click()

    const confirmAddedToRollPage = Page.verifyOnPage(ConfirmAddedToRollPage)
    confirmAddedToRollPage.checkDetails({
      name: 'Bob Smith',
      prison: 'Moorland (HMP & YOI)',
      prisonNumber: arrival.potentialMatches[0].prisonNumber,
      locationName: 'Reception',
    })
    confirmAddedToRollPage.addCaseNote(arrival.potentialMatches[0].prisonNumber).exists()
    confirmAddedToRollPage.viewEstablishmentRoll().exists()
    confirmAddedToRollPage.addAnotherToRoll().click()

    Page.verifyOnPage(ChoosePrisonerPage)

    cy.task('getUnexpectedConfirmationRequest').then(request => {
      expect(request).to.deep.equal({
        dateOfBirth: '1972-11-21',
        firstName: 'Bob',
        imprisonmentStatus: 'SENT',
        lastName: 'Smith',
        movementReasonCode: '26',
        prisonId: 'MDI',
        prisonNumber: 'G0014GM',
        sex: 'M',
      })
    })
  })

  it('should display search page', () => {
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.firstName().type('James')
    searchPage.lastName().type('Smith')
    searchPage.day().type('21')
    searchPage.month().type('11')
    searchPage.year().type('1972')
    searchPage.otherSearchDetails().click()
    searchPage.pncNumber().type('01/23456M')
    searchPage.prisonNumber().type('A1234AA')
    searchPage.search().click()
    const multipleRecordsFoundPage = Page.verifyOnPage(MultipleRecordsFoundPage)

    multipleRecordsFoundPage.searchAgain().click()

    Page.verifyOnPage(SearchForExistingPage)
  })
})
