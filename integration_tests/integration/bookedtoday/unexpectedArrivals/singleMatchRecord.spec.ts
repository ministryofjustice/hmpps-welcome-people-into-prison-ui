import Page from '../../../pages/page'
import Role from '../../../../server/authentication/role'
import SearchForExistingPage from '../../../pages/bookedtoday/unexpectedArrivals/searchForExistingRecord'
import SingleRecordFoundPage from '../../../pages/bookedtoday/unexpectedArrivals/singleRecordFound'

context('Unexpected arrivals - Single matching record found', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.signIn()
    SearchForExistingPage.goTo()
  })
  it('Display content in single match page', () => {
    cy.task('stubUnexpectedArrivalsMatchedRecords', [
      {
        firstName: 'Bob',
        lastName: 'Smith',
        dateOfBirth: '1972-11-21',
        prisonNumber: 'G0014GM',
        pncNumber: '01/1111A',
        sex: 'MALE',
      },
    ])
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.otherSearchDetails().click()
    searchPage.firstName().type('James')
    searchPage.lastName().type('Smith')
    searchPage.day().type('01')
    searchPage.month().type('08')
    searchPage.year().type('2000')
    searchPage.otherSearchDetails().click()
    searchPage.prisonNumber().type('G0014GM')
    searchPage.search().click()
    const singleRecordPage = Page.verifyOnPage(SingleRecordFoundPage)
    singleRecordPage.existingRecordPrisonerName().contains('Bob Smith')
    singleRecordPage.existingRecordDob().contains('21 November 1972')
    singleRecordPage.existingRecordPrisonNumber().contains('G0014GM')
    singleRecordPage.existingRecordPncNumber().contains('01/1111A')
  })
})
