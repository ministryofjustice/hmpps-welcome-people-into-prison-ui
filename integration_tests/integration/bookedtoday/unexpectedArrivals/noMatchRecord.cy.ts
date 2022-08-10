import Page from '../../../pages/page'
import Role from '../../../../server/authentication/role'
import SearchForExistingPage from '../../../pages/bookedtoday/unexpectedArrivals/searchForExistingRecord'
import NoRecordsFoundPage from '../../../pages/bookedtoday/unexpectedArrivals/noRecordsFound'
import ImprisonmentStatusPage from '../../../pages/bookedtoday/arrivals/confirmArrival/imprisonmentStatus'
import MovementReasonsPage from '../../../pages/bookedtoday/arrivals/confirmArrival/movementReasons'
import ConfirmAddedToRollPage from '../../../pages/bookedtoday/arrivals/confirmArrival/confirmAddedToRoll'
import ChoosePrisonerPage from '../../../pages/bookedtoday/choosePrisoner'
import AddPersonalDetailsPage from '../../../pages/bookedtoday/unexpectedArrivals/addPersonalDetails'
import CheckAnswersForCreateNewRecordPage from '../../../pages/bookedtoday/arrivals/confirmArrival/checkAnswersForCreateNewRecord'

context('Unexpected arrivals - no matching records page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubImprisonmentStatus')
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [] })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [] })
    cy.task('stubRetrieveMultipleBodyScans', [])
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
    noRecordPage.continue().click()

    const addPersonalDetailsPage = Page.verifyOnPage(AddPersonalDetailsPage)
    addPersonalDetailsPage.firstName().type('James')
    addPersonalDetailsPage.lastName().type('Smith')
    addPersonalDetailsPage.day().type('01')
    addPersonalDetailsPage.month().type('08')
    addPersonalDetailsPage.year().type('2000')
    addPersonalDetailsPage.sex().check('M')
    addPersonalDetailsPage.continue().click()

    const imprisonmentStatusPage = Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('determinate-sentence').click()
    imprisonmentStatusPage.continue().click()

    const movementReasonPage = Page.verifyOnPage(MovementReasonsPage)
    movementReasonPage.movementReasonRadioButton('26').click()
    movementReasonPage.continue().click()

    const checkAnswersPage = Page.verifyOnPage(CheckAnswersForCreateNewRecordPage)

    checkAnswersPage.name().should('contain.text', 'James Smith')
    checkAnswersPage.dob().should('contain.text', '1 August 2000')
    checkAnswersPage.sex().should('contain.text', 'Male')
    checkAnswersPage
      .reason()
      .should('contain.text', 'Sentenced - fixed length of time - Extended sentence for public protection')
    cy.task('stubConfirmUnexpectedArrval', { prisonNumber: 'G0014GM', location: 'Reception' })
    checkAnswersPage.addToRoll().click()

    const confirmAddedToRollPage = Page.verifyOnPage(ConfirmAddedToRollPage)
    confirmAddedToRollPage.details({
      name: 'James Smith',
      prison: 'Moorland (HMP & YOI)',
      prisonNumber: 'G0014GM',
      locationName: 'Reception',
    })
    confirmAddedToRollPage.addCaseNote('G0014GM').exists()
    confirmAddedToRollPage.viewEstablishmentRoll().exists()
    confirmAddedToRollPage.addAnotherToRoll().click()

    Page.verifyOnPage(ChoosePrisonerPage)

    cy.task('getUnexpectedConfirmationRequest').then(request => {
      expect(request).to.deep.equal({
        dateOfBirth: '2000-08-01',
        firstName: 'James',
        sex: 'M',
        imprisonmentStatus: 'SENT',
        lastName: 'Smith',
        movementReasonCode: '26',
        prisonId: 'MDI',
      })
    })
  })
})
