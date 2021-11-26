import Page from '../pages/page'
import ConfirmArrivalPage from '../pages/confirmArrival'
import ImprisonmentStatusPage from '../pages/imprisonmentStatus'
import CheckAnswersPage from '../pages/checkAnswers'
import ConfirmAddedToRollPage from '../pages/confirmAddedToRoll'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'

const expectedArrival = expectedArrivals.court.notCurrent

context('Check Answers', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubMissingPrisonerImage')
    cy.task('stubPrison', 'MDI')
    cy.task('stubImprisonmentStatus')
  })

  it('Should contain a full set of correctly formatted move data', () => {
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const confirmArrivalPage = ConfirmArrivalPage.goTo(expectedArrival.id)
    confirmArrivalPage.continue().click()

    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    const checkAnswersPage = CheckAnswersPage.goTo(expectedArrival.id)

    checkAnswersPage.name().should('contain.text', 'Sam Smith')
    checkAnswersPage.dob().should('contain.text', '1 February 1970')
    checkAnswersPage.prisonNumber().should('contain.text', 'G0014GM')
    checkAnswersPage.pncNumber().should('contain.text', '01/4567A')
    checkAnswersPage.reason().should('contain.text', 'On remand')
    cy.task('stubCreateOffenderRecordAndBooking', expectedArrival.id)
    checkAnswersPage.addToRoll().click()
    Page.verifyOnPage(ConfirmAddedToRollPage)
  })

  it('Should not display prison or pnc numbers if none present', () => {
    expectedArrival.prisonNumber = null
    expectedArrival.pncNumber = null

    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const confirmArrivalPage = ConfirmArrivalPage.goTo(expectedArrival.id)
    confirmArrivalPage.continue().click()

    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    const checkAnswersPage = CheckAnswersPage.goTo(expectedArrival.id)
    checkAnswersPage.prisonNumber().should('not.exist')
    checkAnswersPage.pncNumber().should('not.exist')
    cy.task('stubCreateOffenderRecordAndBooking', expectedArrival.id)
    checkAnswersPage.addToRoll().click()
    Page.verifyOnPage(ConfirmAddedToRollPage)
  })
})
