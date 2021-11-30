import Page from '../pages/page'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'
import ChoosePrisonerPage from '../pages/choosePrisoner'
import CheckTransferPage from '../pages/checkTransfer'
import ConfirmTransferAddedToRollPage from '../pages/confirmTransferAddedToRoll'

context('Check Transfer', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubExpectedArrivals', {
      caseLoadId: 'MDI',
      arrivals: [expectedArrivals.court],
    })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [expectedArrivals.prisonTransfer] })
    cy.task('stubTransfer', {
      caseLoadId: 'MDI',
      prisonNumber: expectedArrivals.prisonTransfer.prisonNumber,
      transfer: expectedArrivals.prisonTransfer,
    })
    cy.task('stubConfirmTransfer', expectedArrivals.prisonTransfer.prisonNumber)
    cy.task('stubPrison', 'MDI')
    cy.signIn()
  })

  it('Should go to check-transfer page when clicking prisoners name in choose-prisoner page', () => {
    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('PRISON')(1).confirm().should('exist')
    choosePrisonerPage.arrivalFrom('PRISON')(1).confirm().click()
    Page.verifyOnPage(CheckTransferPage)
  })

  it('Should go to confirm-transfer page when clicking add to roll button', () => {
    const checkTransferPage = CheckTransferPage.goTo(expectedArrivals.prisonTransfer.prisonNumber)
    checkTransferPage.addToRoll().click()
    Page.verifyOnPage(ConfirmTransferAddedToRollPage)
  })

  it('Should return to choose-prisoner page when clicking Return to list link', () => {
    const checkTransferPage = CheckTransferPage.goTo(expectedArrivals.prisonTransfer.prisonNumber)
    checkTransferPage.choosePrisoner().click()
    Page.verifyOnPage(ChoosePrisonerPage)
  })
})
