import Page from '../../../pages/page'
import Role from '../../../../server/authentication/role'
import SearchForExistingPage from '../../../pages/bookedtoday/unexpectedArrivals/searchForExistingRecord'
import SingleRecordFoundPage from '../../../pages/bookedtoday/unexpectedArrivals/singleRecordFound'
import ImprisonmentStatusPage from '../../../pages/bookedtoday/arrivals/confirmArrival/imprisonmentStatus'
import MovementReasonsPage from '../../../pages/bookedtoday/arrivals/confirmArrival/movementReasons'
import CheckAnswersPage from '../../../pages/bookedtoday/arrivals/confirmArrival/checkAnswers'
import ConfirmAddedToRollPage from '../../../pages/bookedtoday/arrivals/confirmArrival/confirmAddedToRoll'
import ChoosePrisonerPage from '../../../pages/bookedtoday/choosePrisoner'

context('Unexpected arrivals - Single matching record found', () => {
  const arrival = {
    firstName: 'Bob',
    lastName: 'Smith',
    dateOfBirth: '1972-11-21',
    prisonNumber: 'G0014GM',
    pncNumber: '01/1111A',
    sex: 'MALE',
  }

  beforeEach(() => {
    cy.task('resetRedis')
    cy.task('reset')
    cy.task('stubSignIn', [Role.PRISON_RECEPTION])
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubImprisonmentStatus')
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [] })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [] })
    cy.task('stubPrisonerDetails', { ...arrival, arrivalType: 'NEW_BOOKING' })
    cy.task('stubRetrieveMultipleBodyScans', [arrival])
    cy.signIn()
    SearchForExistingPage.goTo()
  })

  it('Can confirm a single match', () => {
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
    singleRecordPage.continue().click()

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
    cy.task('stubConfirmUnexpectedArrval', { prisonNumber: 'G0014GM', location: 'Reception' })
    checkAnswersPage.addToRoll().click()

    const confirmAddedToRollPage = Page.verifyOnPage(ConfirmAddedToRollPage)
    confirmAddedToRollPage.checkDetails({
      name: 'Bob Smith',
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
        dateOfBirth: '1972-11-21',
        firstName: 'Bob',
        sex: 'M',
        imprisonmentStatus: 'SENT',
        lastName: 'Smith',
        movementReasonCode: '26',
        prisonId: 'MDI',
        prisonNumber: 'G0014GM',
      })
    })
  })
})
