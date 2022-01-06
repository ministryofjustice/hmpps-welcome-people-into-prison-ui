import Page from '../pages/page'
import FeatureNotAvailable from '../pages/featureNotAvailable'
import ConfirmArrivalPage from '../pages/confirmArrival'
import ImprisonmentStatusPage from '../pages/imprisonmentStatus'
import CheckAnswersPage from '../pages/checkAnswers'
import ConfirmAddedToRollPage from '../pages/confirmAddedToRoll'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'
import SexPage from '../pages/sexPage'

context('Feature not available', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubMissingPrisonerImage')
    cy.task('stubPrison', 'MDI')
    cy.task('stubImprisonmentStatus')
  })

  it('Should display feature-not-available page', () => {
    const expectedArrival = expectedArrivals.custodySuite.current
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const confirmArrivalPage = ConfirmArrivalPage.goTo(expectedArrival.id)
    confirmArrivalPage.continue().click()

    const sexPage = Page.verifyOnPage(SexPage)
    sexPage.sexRadioButtons('M').click()
    sexPage.continue().click()

    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    const checkAnswersPage = CheckAnswersPage.goTo(expectedArrival.id)

    checkAnswersPage.addToRoll().click()
    Page.verifyOnPage(FeatureNotAvailable)
  })

  it('Should not display feature-not-available page', () => {
    const expectedArrival = expectedArrivals.court.current
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const confirmArrivalPage = ConfirmArrivalPage.goTo(expectedArrival.id)
    confirmArrivalPage.continue().click()

    const sexPage = Page.verifyOnPage(SexPage)
    sexPage.sexRadioButtons('M').click()
    sexPage.continue().click()

    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    const checkAnswersPage = CheckAnswersPage.goTo(expectedArrival.id)

    cy.task('stubCreateOffenderRecordAndBooking', expectedArrival.id)
    checkAnswersPage.addToRoll().click()
    Page.verifyOnPage(ConfirmAddedToRollPage)
  })
})
