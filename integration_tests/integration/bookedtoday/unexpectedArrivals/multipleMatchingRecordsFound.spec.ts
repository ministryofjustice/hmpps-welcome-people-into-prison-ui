import Page from '../../../pages/page'
import Role from '../../../../server/authentication/role'
import SearchForExistingPage from '../../../pages/bookedtoday/unexpectedArrivals/searchForExistingRecord'
import MultipleRecordsFoundPage from '../../../pages/bookedtoday/unexpectedArrivals/multipleRecordsFound'
import ImprisonmentStatus from '../../../pages/bookedtoday/arrivals/confirmArrival/imprisonmentStatus'
import expectedArrivals from '../../../mockApis/responses/expectedArrivals'

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
    cy.task('stubPrisonerDetails', arrival.potentialMatches[0])
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

    let match
    match = multipleRecordsFoundPage.match(1)
    match.fieldName('prisoner-name').should('contain', 'Bob Smith')
    match.fieldName('dob').should('contain', '21 November 1972')
    match.fieldName('prison-number').should('contain', arrival.potentialMatches[0].prisonNumber)
    match.fieldName('pnc-number').should('contain', arrival.potentialMatches[0].pncNumber)
    match.fieldName('cro-number').should('contain', arrival.potentialMatches[0].croNumber)

    match = multipleRecordsFoundPage.match(2)
    match.fieldName('prisoner-name').should('contain', 'Robert Smyth')
    match.fieldName('dob').should('contain', '21 November 1982')
    match.fieldName('prison-number').should('contain', arrival.potentialMatches[1].prisonNumber)
    match.fieldName('pnc-number').should('contain', arrival.potentialMatches[1].pncNumber)
    match.fieldName('cro-number').should('contain', arrival.potentialMatches[1].croNumber)
    match.prisonerImage().should('have.attr', 'src', `/prisoners/${arrival.potentialMatches[1].prisonNumber}/image`)

    multipleRecordsFoundPage.continue().click()
    multipleRecordsFoundPage.hasError('Select an existing record or search using different details')

    match.select().click()
    multipleRecordsFoundPage.continue().click()

    Page.verifyOnPage(ImprisonmentStatus)
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
