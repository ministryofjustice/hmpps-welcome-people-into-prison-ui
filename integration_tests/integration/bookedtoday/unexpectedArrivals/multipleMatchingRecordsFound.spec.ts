import Page from '../../../pages/page'
import Role from '../../../../server/authentication/role'
import SearchForExistingPage from '../../../pages/bookedtoday/unexpectedArrivals/searchForExistingRecord'
import MultipleRecordsFoundPage from '../../../pages/bookedtoday/unexpectedArrivals/multipleRecordsFound'
import ImprisonmentStatus from '../../../pages/bookedtoday/arrivals/confirmArrival/imprisonmentStatus'

const matchedDetails = [
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
]

context('Unexpected arrivals - multiple matching records', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubImprisonmentStatus')
    cy.task('stubPrisonerDetails', matchedDetails[0])
    cy.signIn()

    SearchForExistingPage.goTo()
    cy.task('stubUnexpectedArrivalsMatchedRecords', matchedDetails)
  })

  it('should display page contents', () => {
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.otherSearchDetails().click()
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

    const arrival = multipleRecordsFoundPage.arrival()
    arrival.fieldName('prisoner-name').should('contain', 'James Smith')
    arrival.fieldName('dob').should('contain', '21 November 1972')
    arrival.fieldName('prison-number').should('contain', 'A1234AA')
    arrival.fieldName('pnc-number').should('contain', '01/23456M')

    let match
    match = multipleRecordsFoundPage.chooseMatch(1)
    match.fieldName('prisoner-name').should('contain', 'Bob Smith')
    match.fieldName('dob').should('contain', '21 November 1972')
    match.fieldName('prison-number').should('contain', 'G0014GM')
    match.fieldName('pnc-number').should('contain', '01/1111A')
    match.fieldName('cro-number').should('contain', '01/0000A')

    match = multipleRecordsFoundPage.chooseMatch(2)
    match.fieldName('prisoner-name').should('contain', 'Robert Smyth')
    match.fieldName('dob').should('contain', '21 November 1982')
    multipleRecordsFoundPage.prisonerImage().should('have.attr', 'src', `/prisoners/G0014GM/image`)
  })

  it('should display error messages', () => {
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.otherSearchDetails().click()
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

    multipleRecordsFoundPage.continue().click()
    multipleRecordsFoundPage.hasError('Select an existing record or search using different details')
  })
  it('should progress to next page if no errors', () => {
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.otherSearchDetails().click()
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

    const match = multipleRecordsFoundPage.match(1)
    match.click()
    multipleRecordsFoundPage.continue().click()

    Page.verifyOnPage(ImprisonmentStatus)
  })
})
