import Page from '../../../pages/page'
import Role from '../../../../server/authentication/role'
import SearchForExistingPage from '../../../pages/bookedtoday/unexpectedArrivals/searchForExistingRecord'
import NoRecordsFoundPage from '../../../pages/bookedtoday/unexpectedArrivals/noRecordsFound'

context('Unexpected arrivals - no matching records page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.signIn()
    SearchForExistingPage.goTo()
  })

  it('Display content in no match page', () => {
    cy.task('stubUnexpectedArrivalsMatchedRecords', [])
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.otherSearchDetails().click()
    searchPage.firstName().type('James')
    searchPage.lastName().type('Smith')
    searchPage.day().type('01')
    searchPage.month().type('08')
    searchPage.year().type('2000')
    searchPage.search().click()
    const noRecordPage = Page.verifyOnPage(NoRecordsFoundPage)
    noRecordPage.name().contains('James Smith')
    noRecordPage.dob().contains('1 August 2000')
  })
})
