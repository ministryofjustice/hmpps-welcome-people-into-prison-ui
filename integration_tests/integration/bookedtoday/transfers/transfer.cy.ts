import Page from '../../../pages/page'
import Role from '../../../../server/authentication/role'
import expectedArrivals from '../../../mockApis/responses/expectedArrivals'
import ChoosePrisonerPage from '../../../pages/bookedtoday/choosePrisoner'
import CheckTransferPage from '../../../pages/bookedtoday/transfers/checkTransfer'
import ConfirmTransferAddedToRollPage from '../../../pages/bookedtoday/transfers/confirmTransferAddedToRoll'

const expectedArrival = expectedArrivals.prisonTransfer

context('Confirm transfer added To roll', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubExpectedArrivals', {
      caseLoadId: 'MDI',
      arrivals: [],
    })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [expectedArrival] })
    cy.task('stubTransfer', {
      caseLoadId: 'MDI',
      prisonNumber: expectedArrival.prisonNumber,
      transfer: expectedArrival,
    })
    cy.task('stubConfirmTransfer', expectedArrival.prisonNumber)
    cy.task('stubRetrieveMultipleBodyScans', [])
    cy.signIn()
  })

  it('Can back out of confirmation', () => {
    const checkTransferPage = CheckTransferPage.goTo(expectedArrivals.prisonTransfer.prisonNumber)
    checkTransferPage.choosePrisoner().click()
    Page.verifyOnPage(ChoosePrisonerPage)
  })

  it('Can confirm prison transfers', () => {
    ChoosePrisonerPage.goTo().arrivalFrom('PRISON')(1).confirm().click()
    const checkTransferPage = Page.verifyOnPage(CheckTransferPage)
    checkTransferPage.addToRoll().click()

    const confirmTransferAddedToRollPage = Page.verifyOnPage(ConfirmTransferAddedToRollPage)
    confirmTransferAddedToRollPage.addCaseNote(expectedArrivals.prisonTransfer.prisonNumber).exists()
    confirmTransferAddedToRollPage.viewEstablishmentRoll().exists()
    confirmTransferAddedToRollPage.addAnotherToRoll().click()

    Page.verifyOnPage(ChoosePrisonerPage)

    cy.task('getTransferConfirmationRequest', expectedArrival.prisonNumber).then(request => {
      expect(request).to.deep.equal({ prisonId: 'MDI' })
    })
  })
})
