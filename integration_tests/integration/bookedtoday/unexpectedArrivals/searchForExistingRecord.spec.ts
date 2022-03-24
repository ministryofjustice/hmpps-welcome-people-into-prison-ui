import Page from '../../../pages/page'
import Role from '../../../../server/authentication/role'
import SearchForExistingPage from '../../../pages/bookedtoday/unexpectedArrivals/searchForExistingRecord'
import NoRecordsFoundPage from '../../../pages/bookedtoday/unexpectedArrivals/noRecordsFound'
import SingleRecordFoundPage from '../../../pages/bookedtoday/unexpectedArrivals/singleRecordFound'
import MultipleRecordsFoundPage from '../../../pages/bookedtoday/unexpectedArrivals/multipleRecordsFound'

context('Unexpected arrivals - Search for existing record spec', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.signIn()
    SearchForExistingPage.goTo()
  })

  it('Search with no details', () => {
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.search().click()
    searchPage.hasError("You must search using either the prisoner's last name, prison number or PNC Number")
  })
  it('Enter first name only', () => {
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.firstName().type('James')
    searchPage.search().click()
    searchPage.hasError('Enter a last name')
  })

  it('Enter partial date only', () => {
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.day().type('01')
    searchPage.search().click()
    searchPage.hasError("You must search using either the prisoner's last name, prison number or PNC Number")
    searchPage.hasError('Date of birth must include a month and year')
  })

  it('Redirects to no match page', () => {
    cy.task('stubUnexpectedArrivalsMatchedRecords', [])
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.otherSearchDetails().click()
    searchPage.firstName().type('James')
    searchPage.lastName().type('Smith')
    searchPage.day().type('01')
    searchPage.month().type('08')
    searchPage.year().type('2000')
    searchPage.search().click()
    Page.verifyOnPage(NoRecordsFoundPage)
  })
  it('Redirects to single match page', () => {
    cy.task('stubUnexpectedArrivalsMatchedRecords', [
      {
        firstName: 'Bob',
        lastName: 'Smith',
        dateOfBirth: '1972-11-21',
        prisonNumber: 'G0014GM',
        pncNumber: '01/1111A',
        croNumber: '01/0000A',
        sex: 'MALE',
      },
    ])
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.otherSearchDetails().click()
    searchPage.prisonNumber().type('G0014GM')
    searchPage.search().click()
    Page.verifyOnPage(SingleRecordFoundPage)
  })

  it('Redirects to multiple match page', () => {
    cy.task('stubUnexpectedArrivalsMatchedRecords', [
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
    ])
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.otherSearchDetails().click()
    searchPage.pncNumber().type('01/23456M')
    searchPage.search().click()
    Page.verifyOnPage(MultipleRecordsFoundPage)
  })
})
