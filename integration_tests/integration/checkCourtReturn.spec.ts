import Page from '../pages/page'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'
import ChoosePrisonerPage from '../pages/choosePrisoner'
import CheckCourtReturnPage from '../pages/checkCourtReturn'
import ConfirmCourtReturnAddedToRollPage from '../pages/confirmCourtReturnAddedToRoll'

const expectedArrival = expectedArrivals.court.current

context('Check Court Return', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubExpectedArrival', expectedArrival)
    cy.task('stubExpectedArrivals', {
      caseLoadId: 'MDI',
      arrivals: [
        expectedArrivals.custodySuite.current,
        expectedArrivals.custodySuite.notCurrent,
        expectedArrivals.custodySuite.notMatched,
        expectedArrivals.other,
        expectedArrivals.court.current,
        expectedArrivals.court.notCurrent,
        expectedArrivals.court.notMatched,
      ],
    })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [expectedArrivals.prisonTransfer] })
    cy.task('stubConfirmCourtReturn', expectedArrival.id)
    cy.signIn()
  })

  it('Should go to prisoner-returned-from-court page when clicking add to roll button', () => {
    const checkCourtReturnPage = CheckCourtReturnPage.goTo(expectedArrival.id)
    checkCourtReturnPage.addToRoll().click()
    Page.verifyOnPage(ConfirmCourtReturnAddedToRollPage)
  })

  it('Should return to choose-prisoner page when clicking Return to list link', () => {
    const checkCourtReturnPage = CheckCourtReturnPage.goTo(expectedArrival.id)
    checkCourtReturnPage.returnToArrivalsList().click()
    Page.verifyOnPage(ChoosePrisonerPage)
  })
})
