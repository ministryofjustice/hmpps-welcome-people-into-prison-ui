import Page from '../../../pages/page'
import SingleRecordFoundPage from '../../../pages/bookedtoday/arrivals/singleRecordFound'
import ImprisonmentStatusPage from '../../../pages/bookedtoday/arrivals/imprisonmentStatus'
import CheckAnswersPage from '../../../pages/bookedtoday/arrivals/checkAnswers'
import ConfirmAddedToRollPage from '../../../pages/bookedtoday/arrivals/confirmAddedToRoll'
import Role from '../../../../server/authentication/role'
import expectedArrivals from '../../../mockApis/responses/expectedArrivals'
import SexPage from '../../../pages/bookedtoday/arrivals/sexPage'
import ChoosePrisonerPage from '../../../pages/bookedtoday/choosePrisoner'
import MovementReasonsPage from '../../../pages/bookedtoday/arrivals/movementReasons'

const expectedArrival = expectedArrivals.arrival({
  fromLocationType: 'COURT',
  isCurrentPrisoner: false,
  gender: null,
  potentialMatches: [expectedArrivals.potentialMatch],
})

context('Check Answers', () => {
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

  it('Should contain a full set of correctly formatted move data', () => {
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()

    const singleRecordFoundPage = ChoosePrisonerPage.selectPrisoner(expectedArrival.id, SingleRecordFoundPage)
    singleRecordFoundPage.perName().should('contain.text', 'Bob Smith')
    singleRecordFoundPage.perDob().should('contain.text', '1 January 1970')
    singleRecordFoundPage.perPrisonNumber().should('contain.text', 'G0015GF')
    singleRecordFoundPage.perPncNumber().should('contain.text', '01/2345A')
    singleRecordFoundPage.continue().should('have.attr', 'href', `/prisoners/${expectedArrival.id}/sex`)

    singleRecordFoundPage.existingName().should('contain.text', 'Sam Smith')
    singleRecordFoundPage.existingDob().should('contain.text', '1 February 1970')
    singleRecordFoundPage.existingPrisonNumber().should('contain.text', 'A1234BC')
    singleRecordFoundPage.existingPncNumber().should('contain.text', '01/4567A')
    singleRecordFoundPage.continue().click()

    const sexPage = Page.verifyOnPage(SexPage)
    sexPage.sexRadioButtons('F').click()
    sexPage.continue().click()

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
    checkAnswersPage.sex().should('contain.text', 'Female')
    checkAnswersPage.reason().should('contain.text', 'Determinate sentence - Extended sentence for public protection')
    cy.task('stubCreateOffenderRecordAndBooking', expectedArrival.id)
    checkAnswersPage.addToRoll().click()

    const confirmAddedToRollPage = Page.verifyOnPage(ConfirmAddedToRollPage)
    confirmAddedToRollPage.confirmationBanner().should('contain.html', 'Sam Smith')
    confirmAddedToRollPage.confirmationBanner().should('contain.html', 'A1234BC')
    confirmAddedToRollPage.confirmationParagraph().should('contain.html', 'Sam Smith')
    confirmAddedToRollPage.confirmationParagraph().should('contain.html', 'Moorland (HMP &amp; YOI)')
    confirmAddedToRollPage.locationParagraph().should('contain.html', 'Reception')
    confirmAddedToRollPage
      .viewEstablishmentRoll()
      .should('contain', 'View establishment roll')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://digital-dev.prison.service.justice.gov.uk/establishment-roll')
      })
    confirmAddedToRollPage
      .backToDigitalPrisonServices()
      .should('contain', 'Back to Digital Prison Services')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://digital-dev.prison.service.justice.gov.uk')
      })
    confirmAddedToRollPage.addAnotherToRoll().click()
    Page.verifyOnPage(ChoosePrisonerPage)
  })

  it('Should show matched results when found', () => {
    expectedArrival.prisonNumber = null
    cy.task('stubExpectedArrival', expectedArrival)

    cy.signIn()
    const singleRecordFoundPage = ChoosePrisonerPage.selectPrisoner(expectedArrival.id, SingleRecordFoundPage)
    singleRecordFoundPage.continue().click()

    const sexPage = Page.verifyOnPage(SexPage)
    sexPage.continue().click()
    sexPage.hasError('Select a sex')
    sexPage.sexRadioButtons('M').click()
    sexPage.continue().click()

    const imprisonmentStatusPage = Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    const checkAnswersPage = Page.verifyOnPage(CheckAnswersPage)
    checkAnswersPage.prisonNumber().should('contain.text', 'A1234BC')
    checkAnswersPage.pncNumber().should('contain.text', '01/4567A')
    cy.task('stubCreateOffenderRecordAndBooking', expectedArrival.id)
    checkAnswersPage.addToRoll().click()
    Page.verifyOnPage(ConfirmAddedToRollPage)
  })
})
