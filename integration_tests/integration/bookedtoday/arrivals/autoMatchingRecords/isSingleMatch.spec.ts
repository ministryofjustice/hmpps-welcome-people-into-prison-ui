import Page from '../../../../pages/page'
import SingleMatchingRecordFoundPage from '../../../../pages/bookedtoday/arrivals/autoMatchingRecords/singleMatchingRecordFound'
import ImprisonmentStatusPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/imprisonmentStatus'
import CheckAnswersPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/checkAnswers'
import ConfirmAddedToRollPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/confirmAddedToRoll'
import Role from '../../../../../server/authentication/role'
import expectedArrivals from '../../../../mockApis/responses/expectedArrivals'
import ChoosePrisonerPage from '../../../../pages/bookedtoday/choosePrisoner'
import MovementReasonsPage from '../../../../pages/bookedtoday/arrivals/confirmArrival/movementReasons'
import SearchForExistingPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/search/searchForExisting'

const expectedArrival = expectedArrivals.arrival({
  fromLocationType: 'COURT',
  isCurrentPrisoner: false,
  gender: null,
  potentialMatches: [expectedArrivals.potentialMatch],
})

context('Is Single Match', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [] })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [] })
    cy.task('stubMissingPrisonerImage')
    cy.task('stubPrison', 'MDI')
    cy.task('stubImprisonmentStatus')
  })

  it('Can see PER and matched prison record', () => {
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()

    const singleMatchingRecordFoundPage = ChoosePrisonerPage.selectPrisoner(
      expectedArrival.id,
      SingleMatchingRecordFoundPage
    )
    singleMatchingRecordFoundPage.perName().should('contain.text', 'Bob Smith')
    singleMatchingRecordFoundPage.perDob().should('contain.text', '1 January 1970')
    singleMatchingRecordFoundPage.perPrisonNumber().should('contain.text', 'G0015GF')
    singleMatchingRecordFoundPage.perPncNumber().should('contain.text', '01/2345A')
    singleMatchingRecordFoundPage.continue().should('have.attr', 'href', `/prisoners/${expectedArrival.id}/sex`)

    singleMatchingRecordFoundPage.existingName().should('contain.text', 'Sam Smith')
    singleMatchingRecordFoundPage.existingDob().should('contain.text', '1 February 1970')
    singleMatchingRecordFoundPage.existingPrisonNumber().should('contain.text', 'A1234BC')
    singleMatchingRecordFoundPage.existingPncNumber().should('contain.text', '01/4567A')
    singleMatchingRecordFoundPage.continue().click()

    const imprisonmentStatusPage = Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.continue().click()
    imprisonmentStatusPage.hasError('Select a reason for imprisonment')
    imprisonmentStatusPage.imprisonmentStatusRadioButton('determinate-sentence').click()
    imprisonmentStatusPage.continue().click()

    const movementReasonPage = Page.verifyOnPage(MovementReasonsPage)
    movementReasonPage.continue().click()
    movementReasonPage.hasError('Select the type of determinate sentence')
    movementReasonPage.movementReasonRadioButton('26').click()
    movementReasonPage.continue().click()

    const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage)

    checkAnswersPage.name().should('contain.text', 'Sam Smith')
    checkAnswersPage.dob().should('contain.text', '1 February 1970')
    checkAnswersPage.prisonNumber().should('contain.text', 'A1234BC')
    checkAnswersPage.pncNumber().should('contain.text', '01/4567A')
    checkAnswersPage.sex().should('contain.text', 'Male')
    checkAnswersPage
      .reason()
      .should('contain.text', 'Sentenced - fixed length of time - Extended sentence for public protection')
    cy.task('stubCreateOffenderRecordAndBooking', { arrivalId: expectedArrival.id })
    checkAnswersPage.addToRoll().click()

    const confirmAddedToRollPage = Page.verifyOnPage(ConfirmAddedToRollPage)
    confirmAddedToRollPage.details({
      name: 'Sam Smith',
      prison: 'Moorland (HMP & YOI)',
      prisonNumber: 'A1234BC',
      locationName: 'Reception',
    })
    confirmAddedToRollPage.viewEstablishmentRoll().exists()
    confirmAddedToRollPage.backToDigitalPrisonServices().exists()
    confirmAddedToRollPage.addAnotherToRoll().click()

    Page.verifyOnPage(ChoosePrisonerPage)

    cy.task('getConfirmationRequest', expectedArrival.id).then(request => {
      expect(request).to.deep.equal({
        dateOfBirth: '1970-02-01',
        firstName: 'Sam',
        sex: 'M',
        imprisonmentStatus: 'SENT',
        lastName: 'Smith',
        movementReasonCode: '26',
        prisonId: 'MDI',
        prisonNumber: 'A1234BC',
        fromLocationId: 'MDI',
      })
    })
  })

  it('Should allow navigation to search for alternative', () => {
    expectedArrival.prisonNumber = null
    cy.task('stubExpectedArrival', expectedArrival)

    cy.signIn()
    const singleMatchingRecordFoundPage = ChoosePrisonerPage.selectPrisoner(
      expectedArrival.id,
      SingleMatchingRecordFoundPage
    )
    singleMatchingRecordFoundPage.search().click()

    const searchPage = Page.verifyOnPage(SearchForExistingPage)
    searchPage.name.value().should('contain.text', 'Bob Smith')
  })

  it('Back link navigation is not displayed on confirmation page', () => {
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()

    const singleMatchingRecordFoundPage = ChoosePrisonerPage.selectPrisoner(
      expectedArrival.id,
      SingleMatchingRecordFoundPage
    )
    singleMatchingRecordFoundPage.backNavigation().should('exist')
    singleMatchingRecordFoundPage.continue().click()

    const imprisonmentStatusPage = Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.backNavigation().should('exist')
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage)
    checkAnswersPage.backNavigation().should('exist')
    checkAnswersPage.backNavigation().click()

    Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.backNavigation().click()

    Page.verifyOnPage(SingleMatchingRecordFoundPage)
    singleMatchingRecordFoundPage.continue().click()

    Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    Page.verifyOnPage(CheckAnswersPage)
    cy.task('stubCreateOffenderRecordAndBooking', { arrivalId: expectedArrival.id })
    checkAnswersPage.addToRoll().click()

    const confirmAddedToRollPage = Page.verifyOnPage(ConfirmAddedToRollPage)
    confirmAddedToRollPage.backNavigation().should('not.exist')
  })
})
