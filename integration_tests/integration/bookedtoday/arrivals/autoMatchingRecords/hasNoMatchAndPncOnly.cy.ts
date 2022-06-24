import ChoosePrisonerPage from '../../../../pages/bookedtoday/choosePrisoner'
import Page from '../../../../pages/page'
import Role from '../../../../../server/authentication/role'
import expectedArrivals from '../../../../mockApis/responses/expectedArrivals'
import NoMatchingRecordsFoundPage from '../../../../pages/bookedtoday/arrivals/autoMatchingRecords/noMatchingRecordsFound'
import ReviewPerDetailsPage from '../../../../pages/bookedtoday/arrivals/reviewPerDetails'
import ChangeNamePage from '../../../../pages/bookedtoday/arrivals/changeName'
import ChangeDateOfBirthPage from '../../../../pages/bookedtoday/arrivals/changeDateOfBirth'
import SearchForExistingPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/search/searchForExisting'
import ImprisonmentStatusPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/imprisonmentStatus'
import CheckAnswersForCreateNewRecordPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/checkAnswersForCreateNewRecord'
import ConfirmAddedToRollPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/confirmAddedToRoll'

const arrival = expectedArrivals.arrival({
  prisonNumber: null,
  fromLocationType: 'COURT',
  isCurrentPrisoner: false,
  potentialMatches: [],
})

context('No match found', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [] })
    cy.task('stubMissingPrisonerImage')
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [arrival] })
    cy.task('stubExpectedArrival', arrival)
    cy.task('stubImprisonmentStatus')

    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()
  })

  it('Check no match page', () => {
    const noMatchingRecordsFoundPage = Page.verifyOnPage(NoMatchingRecordsFoundPage)
    noMatchingRecordsFoundPage.perName().should('contain.text', 'Bob Smith')
    noMatchingRecordsFoundPage.perDob().should('contain.text', '1 January 1970')
    noMatchingRecordsFoundPage.perPncNumber().should('contain.text', '01/2345A')
    noMatchingRecordsFoundPage.search().click()

    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.name.value().should('contain.text', 'Bob Smith')
  })

  it('Change name', () => {
    const noMatchingRecordsFoundPage = Page.verifyOnPage(NoMatchingRecordsFoundPage)
    noMatchingRecordsFoundPage.continue().click()
    {
      const reviewPerDetailsPage = Page.verifyOnPage(ReviewPerDetailsPage)
      const { value, change } = reviewPerDetailsPage.name
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
      const reviewPerDetailsPage = Page.verifyOnPage(ReviewPerDetailsPage)
      reviewPerDetailsPage.name.value().contains('James Joyce')
    }
  })

  it('Change date of birth', () => {
    const noMatchingRecordsFoundPage = Page.verifyOnPage(NoMatchingRecordsFoundPage)
    noMatchingRecordsFoundPage.continue().click()
    {
      const reviewPerDetailsPage = Page.verifyOnPage(ReviewPerDetailsPage)
      const { value, change } = reviewPerDetailsPage.dob
      value().contains('1 January 1970')
      change().click()
    }

    const changeDobPage = Page.verifyOnPage(ChangeDateOfBirthPage)
    changeDobPage.day().should('have.value', '01')
    changeDobPage.month().should('have.value', '01')
    changeDobPage.year().should('have.value', '1970')

    changeDobPage.day().clear().type('20')
    changeDobPage.month().clear().type('9')
    changeDobPage.year().clear()

    changeDobPage.save().click()

    changeDobPage.hasError('Date of birth must include a year')
    changeDobPage.year().type('1982')

    changeDobPage.save().click()

    {
      const reviewPerDetailsPage = Page.verifyOnPage(ReviewPerDetailsPage)
      const { value } = reviewPerDetailsPage.dob
      value().contains('20 September 1982')
    }
  })

  it('Can process arrival', () => {
    const noMatchingRecordsFoundPage = Page.verifyOnPage(NoMatchingRecordsFoundPage)
    noMatchingRecordsFoundPage.continue().click()

    Page.verifyOnPage(ReviewPerDetailsPage).continue().click()

    const imprisonmentStatusPage = Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    const checkAnswersPage = Page.verifyOnPage(CheckAnswersForCreateNewRecordPage)
    checkAnswersPage.name().should('contain.text', 'Bob Smith')
    checkAnswersPage.pncNumber().should('contain.text', '01/2345A')
    checkAnswersPage.dob().should('contain.text', '1 January 1970')
    checkAnswersPage.sex().should('contain.text', 'Male')
    checkAnswersPage.reason().should('contain.text', 'On remand')
    checkAnswersPage
      .submissionParagraphTitle()
      .should('contain.text', 'Create prisoner record and add to establishment roll')

    cy.task('stubCreateOffenderRecordAndBooking', { arrivalId: arrival.id })
    checkAnswersPage.addToRoll().click()
    Page.verifyOnPage(ConfirmAddedToRollPage)

    cy.task('getConfirmationRequest', arrival.id).then(request => {
      expect(request).to.deep.equal({
        dateOfBirth: '1970-01-01',
        firstName: 'Bob',
        lastName: 'Smith',
        fromLocationId: 'MDI',
        sex: 'M',
        imprisonmentStatus: 'RX',
        movementReasonCode: 'R',
        prisonId: 'MDI',
      })
    })
  })
})
