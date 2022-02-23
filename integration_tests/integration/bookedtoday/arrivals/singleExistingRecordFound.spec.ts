import Page from '../../../pages/page'
import ChoosePrisonerPage from '../../../pages/bookedtoday/choosePrisoner'
import SingleRecordFoundPage from '../../../pages/bookedtoday/arrivals/singleRecordFound'
import SexPage from '../../../pages/bookedtoday/arrivals/sexPage'
import CheckAnswersPage from '../../../pages/bookedtoday/arrivals/checkAnswers'
import ConfirmAddedToRollPage from '../../../pages/bookedtoday/arrivals/confirmAddedToRoll'
import Role from '../../../../server/authentication/role'
import expectedArrivals from '../../../mockApis/responses/expectedArrivals'

const expectedArrival = expectedArrivals.court.notCurrent

context('Confirm Arrival', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [] })
    cy.task('stubMissingPrisonerImage')
  })

  it('PER record should contain a full set of correctly formatted move data', () => {
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [expectedArrival] })
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()

    const singleRecordFoundPage = SingleRecordFoundPage.goTo(expectedArrival.id)

    singleRecordFoundPage.perName().should('contain.text', 'Sam Smith')
    singleRecordFoundPage.perDob().should('contain.text', '1 February 1970')
    singleRecordFoundPage.perPrisonNumber().should('contain.text', 'G0014GM')
    singleRecordFoundPage.perPncNumber().should('contain.text', '01/4567A')
    singleRecordFoundPage.continue().should('have.attr', 'href', `/prisoners/${expectedArrival.id}/sex`)
    singleRecordFoundPage.continue().click()

    const imprisonmentStatusPage = SexPage.goToWithRedirect(expectedArrival.id)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    const checkAnswersPage = CheckAnswersPage.goTo(expectedArrival.id)
    cy.task('stubCreateOffenderRecordAndBooking', expectedArrival.id)
    checkAnswersPage.addToRoll().click()
    Page.verifyOnPage(ConfirmAddedToRollPage)
  })

  it('PER record should not display prison number', () => {
    expectedArrival.prisonNumber = null

    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [expectedArrival] })
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()

    const singleRecordFoundPage = SingleRecordFoundPage.goTo(expectedArrival.id)
    singleRecordFoundPage.perPrisonNumber().should('contain.text', '')
  })

  it('PER record should not display pnc number', () => {
    expectedArrival.pncNumber = null

    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [expectedArrival] })
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()

    const singleRecordFoundPage = SingleRecordFoundPage.goTo(expectedArrival.id)
    singleRecordFoundPage.perPncNumber().should('contain.text', '')
  })

  it('Existing record should contain a full set of correctly formatted move data', () => {
    expectedArrival.potentialMatches = [
      {
        firstName: 'Sam',
        lastName: 'Smith',
        dateOfBirth: '1970-02-01',
        prisonNumber: 'A1234BC',
        pncNumber: '01/4567A',
      },
    ]

    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [expectedArrival] })
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()

    const singleRecordFoundPage = SingleRecordFoundPage.goTo(expectedArrival.id)

    singleRecordFoundPage.existingName().should('contain.text', 'Sam Smith')
    singleRecordFoundPage.existingDob().should('contain.text', '1 February 1970')
    singleRecordFoundPage.existingPrisonNumber().should('contain.text', 'A1234BC')
    singleRecordFoundPage.existingPncNumber().should('contain.text', '01/4567A')
    singleRecordFoundPage
      .prisonerImage()
      .should('have.attr', 'src', `/prisoners/${expectedArrival.potentialMatches[0].prisonNumber}/image`)
    singleRecordFoundPage.continue().should('have.attr', 'href', `/prisoners/${expectedArrival.id}/sex`)
  })

  it('Existing record should not contain prison number', () => {
    expectedArrival.potentialMatches = [
      {
        firstName: 'Sam',
        lastName: 'Smith',
        dateOfBirth: '1970-02-01',
        pncNumber: '01/4567A',
        prisonNumber: undefined,
      },
    ]

    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [expectedArrival] })
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()

    const singleRecordFoundPage = SingleRecordFoundPage.goTo(expectedArrival.id)

    singleRecordFoundPage.existingPrisonNumber().should('contain.text', '')
  })
  it('Existing record should not contain pnc number', () => {
    expectedArrival.potentialMatches = [
      {
        firstName: 'Sam',
        lastName: 'Smith',
        dateOfBirth: '1970-02-01',
        prisonNumber: 'A1234BC',
        pncNumber: undefined,
      },
    ]

    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [expectedArrival] })
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()

    const singleRecordFoundPage = SingleRecordFoundPage.goTo(expectedArrival.id)

    singleRecordFoundPage.existingPncNumber().should('contain.text', '')
  })
})
