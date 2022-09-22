import ChoosePrisonerPage from '../../../../pages/bookedtoday/choosePrisoner'
import Page from '../../../../pages/page'
import Role from '../../../../../server/authentication/role'
import expectedArrivals from '../../../../mockApis/responses/expectedArrivals'
import SearchForExistingPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/search/searchForExisting'
import SingleExistingRecordFoundPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/singleExistingRecordFound'
import NoExistingRecordsFoundPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/noExistingRecordsFound'
import ChangeNamePage from '../../../../pages/bookedtoday/arrivals/searchforexisting/search/changeName'
import ChangeDateOfBirthPage from '../../../../pages/bookedtoday/arrivals/changeDateOfBirth'
import ChangePrisonNumberPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/search/changePrisonNumber'
import ChangePncNumberPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/search/changePncNumber'
import ReviewDetailsPage from '../../../../pages/bookedtoday/arrivals/reviewDetails'

const singleMatch = [
  {
    firstName: 'Bob',
    lastName: 'Smith',
    dateOfBirth: '1972-11-21',
    prisonNumber: 'G0014GM',
    pncNumber: '01/1111A',
    croNumber: '01/0000A',
    sex: 'MALE',
  },
]

context('Search for existing spec', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [] })
    cy.task('stubRetrieveMultipleBodyScans', [])
    cy.task('stubMissingPrisonerImage')
    const arrival = expectedArrivals.arrival({
      fromLocationType: 'CUSTODY_SUITE',
      isCurrentPrisoner: false,
      dateOfBirth: '1972-11-21',
      pncNumber: null,
      prisonNumber: null,
    })
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [arrival] })
    cy.task('stubExpectedArrival', arrival)

    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(1).confirm().click()
  })

  it('Change name', () => {
    {
      const searchPage = Page.verifyOnPage(SearchForExistingPage)
      const { value, change } = searchPage.name
      value().contains('Bob Smith')
      change().click()
    }

    const changeNamePage = Page.verifyOnPage(ChangeNamePage)
    changeNamePage.firstName().should('have.value', 'Bob')
    changeNamePage.lastName().should('have.value', 'Smith')

    changeNamePage.firstName().clear().type('James')
    changeNamePage.lastName().clear()
    changeNamePage.save().click()

    changeNamePage.hasError("Enter this person's last name")

    changeNamePage.lastName().type('Joyce')
    changeNamePage.save().click()

    {
      const searchPage = Page.verifyOnPage(SearchForExistingPage)
      searchPage.name.value().contains('James Joyce')
    }
  })

  it('Change date of birth', () => {
    {
      const searchPage = Page.verifyOnPage(SearchForExistingPage)
      const { value, change } = searchPage.dob
      value().contains('21 November 1972')
      change().click()
    }

    const changeDobPage = Page.verifyOnPage(ChangeDateOfBirthPage)
    changeDobPage.day().should('have.value', '21')
    changeDobPage.month().should('have.value', '11')
    changeDobPage.year().should('have.value', '1972')

    changeDobPage.day().clear().type('20')
    changeDobPage.month().clear().type('9')
    changeDobPage.year().clear()

    changeDobPage.save().click()

    changeDobPage.hasError('Date of birth must include a year')
    changeDobPage.year().type('1982')

    changeDobPage.save().click()

    {
      const searchPage = Page.verifyOnPage(SearchForExistingPage)
      const { value } = searchPage.dob
      value().contains('20 September 1982')
    }
  })

  it('Change prison number', () => {
    {
      const searchPage = Page.verifyOnPage(SearchForExistingPage)
      const { value, change } = searchPage.prisonNumber
      value().contains('Not entered')
      change().click()
    }

    const changePrisonNumberPage = Page.verifyOnPage(ChangePrisonNumberPage)
    changePrisonNumberPage.prisonNumber().should('have.value', '')

    changePrisonNumberPage.prisonNumber().clear().type('oh no')

    changePrisonNumberPage.save().click()

    changePrisonNumberPage.hasError('Enter a prison number in the correct format')
    changePrisonNumberPage.prisonNumber().clear().type('A1234AA')

    changePrisonNumberPage.save().click()

    {
      const searchPage = Page.verifyOnPage(SearchForExistingPage)
      const { value, remove } = searchPage.prisonNumber
      value().contains('A1234AA')
      remove().click()
      value().contains('Not entered')
    }
  })

  it('Change pnc number', () => {
    {
      const searchPage = Page.verifyOnPage(SearchForExistingPage)
      const { value, change } = searchPage.pnc
      value().contains('Not entered')
      change().click()
    }

    const changePncNumberPage = Page.verifyOnPage(ChangePncNumberPage)
    changePncNumberPage.pnc().should('have.value', '')

    changePncNumberPage.pnc().clear().type('01/23456A')
    changePncNumberPage.save().click()

    {
      const searchPage = Page.verifyOnPage(SearchForExistingPage)
      const { value, remove } = searchPage.pnc
      value().contains('01/23456A')
      remove().click()
      value().contains('Not entered')
    }
  })

  it('Redirects to single match page and allow navigation back to search for alternative', () => {
    cy.task('stubMatchedRecords', singleMatch)
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.search().click()

    const singleMatchingRecordFoundPage = Page.verifyOnPage(SingleExistingRecordFoundPage)
    singleMatchingRecordFoundPage.search().click()

    Page.verifyOnPage(SearchForExistingPage)
    searchPage.name.value().should('contain.text', 'Bob Smith')
  })

  it('Should allow navigation to create a new record on single match page', () => {
    cy.task('stubMatchedRecords', singleMatch)
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.search().click()

    const singleMatchingRecordFoundPage = Page.verifyOnPage(SingleExistingRecordFoundPage)
    singleMatchingRecordFoundPage.createNew().click()

    const reviewDetailsPage = Page.verifyOnPage(ReviewDetailsPage)
    reviewDetailsPage.name.value().should('contain.text', 'Bob Smith')
  })

  it('Redirects to no match page', () => {
    cy.task('stubMatchedRecords', [])
    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.search().click()

    const noExistingRecords = Page.verifyOnPage(NoExistingRecordsFoundPage)
    noExistingRecords.search()
  })
})
