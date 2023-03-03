import ChoosePrisonerPage from '../../../../pages/bookedtoday/choosePrisoner'
import Page from '../../../../pages/page'
import Role from '../../../../../server/authentication/role'
import expectedArrivals from '../../../../mockApis/responses/expectedArrivals'
import NoMatchingRecordsFoundPage from '../../../../pages/bookedtoday/arrivals/autoMatchingRecords/noMatchingRecordsFound'
import ReviewDetailsPage from '../../../../pages/bookedtoday/arrivals/reviewDetails'
import ChangeNamePage from '../../../../pages/bookedtoday/arrivals/changeName'
import ChangeDateOfBirthPage from '../../../../pages/bookedtoday/arrivals/changeDateOfBirth'
import SearchForExistingPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/search/searchForExisting'
import SexPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/sexPage'
import ImprisonmentStatusPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/imprisonmentStatus'
import CheckAnswersForCreateNewRecordPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/checkAnswersForCreateNewRecord'
import ConfirmAddedToRollPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/confirmAddedToRoll'
import PrisonerSummaryMoveOnlyPage from '../../../../pages/bookedtoday/prisonerSummaryMoveOnly'

const arrival = expectedArrivals.arrival({
  prisonNumber: null,
  fromLocationType: 'COURT',
  isCurrentPrisoner: false,
  potentialMatches: [],
})

context('No match found', () => {
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
    cy.task('stubRetrieveMultipleBodyScans', [])

    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()
  })

  it('Check no match page', () => {
    const prisonerSummaryMoveOnlyPage = new PrisonerSummaryMoveOnlyPage(`${arrival.lastName}, ${arrival.firstName}`)
    prisonerSummaryMoveOnlyPage.checkOnPage()
    prisonerSummaryMoveOnlyPage.breadcrumbs().should('exist')
    prisonerSummaryMoveOnlyPage.confirmArrival().click()

    const noMatchingRecordsFoundPage = Page.verifyOnPage(NoMatchingRecordsFoundPage)
    noMatchingRecordsFoundPage.perName().should('contain.text', 'Bob Smith')
    noMatchingRecordsFoundPage.perDob().should('contain.text', '1 January 1970')
    noMatchingRecordsFoundPage.perPncNumber().should('contain.text', '01/2345A')
    noMatchingRecordsFoundPage.search().click()

    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.name.value().should('contain.text', 'Bob Smith')
  })

  it('Change name', () => {
    const prisonerSummaryMoveOnlyPage = new PrisonerSummaryMoveOnlyPage(`${arrival.lastName}, ${arrival.firstName}`)
    prisonerSummaryMoveOnlyPage.checkOnPage()
    prisonerSummaryMoveOnlyPage.breadcrumbs().should('exist')
    prisonerSummaryMoveOnlyPage.confirmArrival().click()

    const noMatchingRecordsFoundPage = Page.verifyOnPage(NoMatchingRecordsFoundPage)
    noMatchingRecordsFoundPage.continue().click()
    {
      const reviewDetailsPage = Page.verifyOnPage(ReviewDetailsPage)
      const { value, change } = reviewDetailsPage.name
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
      const reviewDetailsPage = Page.verifyOnPage(ReviewDetailsPage)
      reviewDetailsPage.name.value().contains('James Joyce')
    }
  })

  it('Change date of birth', () => {
    const prisonerSummaryMoveOnlyPage = new PrisonerSummaryMoveOnlyPage(`${arrival.lastName}, ${arrival.firstName}`)
    prisonerSummaryMoveOnlyPage.checkOnPage()
    prisonerSummaryMoveOnlyPage.breadcrumbs().should('exist')
    prisonerSummaryMoveOnlyPage.confirmArrival().click()

    const noMatchingRecordsFoundPage = Page.verifyOnPage(NoMatchingRecordsFoundPage)
    noMatchingRecordsFoundPage.continue().click()
    {
      const reviewDetailsPage = Page.verifyOnPage(ReviewDetailsPage)
      const { value, change } = reviewDetailsPage.dob
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
      const reviewDetailsPage = Page.verifyOnPage(ReviewDetailsPage)
      const { value } = reviewDetailsPage.dob
      value().contains('20 September 1982')
    }
  })

  it('Redirect to sex page if arrival has no existing sex', () => {
    const arrivalWithNoSex = expectedArrivals.arrival({
      prisonNumber: null,
      fromLocationType: 'COURT',
      isCurrentPrisoner: false,
      gender: null,
      potentialMatches: [],
    })
    cy.task('stubExpectedArrival', arrivalWithNoSex)
    const prisonerSummaryMoveOnlyPage = new PrisonerSummaryMoveOnlyPage(`${arrival.lastName}, ${arrival.firstName}`)
    prisonerSummaryMoveOnlyPage.checkOnPage()
    prisonerSummaryMoveOnlyPage.breadcrumbs().should('exist')
    prisonerSummaryMoveOnlyPage.confirmArrival().click()

    const noMatchingRecordsFoundPage = Page.verifyOnPage(NoMatchingRecordsFoundPage)
    noMatchingRecordsFoundPage.continue().click()

    Page.verifyOnPage(ReviewDetailsPage).continue().click()

    const sexPage = Page.verifyOnPage(SexPage)
    sexPage.sexRadioButtons('M').click()
    sexPage.continue().click()

    Page.verifyOnPage(ImprisonmentStatusPage)
  })

  it('Can process arrival', () => {
    const prisonerSummaryMoveOnlyPage = new PrisonerSummaryMoveOnlyPage(`${arrival.lastName}, ${arrival.firstName}`)
    prisonerSummaryMoveOnlyPage.checkOnPage()
    prisonerSummaryMoveOnlyPage.breadcrumbs().should('exist')
    prisonerSummaryMoveOnlyPage.confirmArrival().click()

    const noMatchingRecordsFoundPage = Page.verifyOnPage(NoMatchingRecordsFoundPage)
    noMatchingRecordsFoundPage.continue().click()

    Page.verifyOnPage(ReviewDetailsPage).continue().click()

    const imprisonmentStatusPage = Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    const checkAnswersPage = Page.verifyOnPage(CheckAnswersForCreateNewRecordPage)
    checkAnswersPage.checkDetails({
      name: 'Bob Smith',
      dob: '1 January 1970',
      sex: 'Male',
      reason: 'On remand',
      pncNumber: '01/2345A',
      submissionParagraphTitle: 'Create prisoner record and add to establishment roll',
    })

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
