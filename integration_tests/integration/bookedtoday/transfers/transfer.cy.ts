import Page from '../../../pages/page'
import Role from '../../../../server/authentication/role'
import expectedArrivals from '../../../mockApis/responses/expectedArrivals'
import ChoosePrisonerPage from '../../../pages/bookedtoday/choosePrisoner'
import CheckTransferPage from '../../../pages/bookedtoday/transfers/checkTransfer'
import SummaryTransferPage from '../../../pages/bookedtoday/transfers/summaryTransfer'
import ConfirmTransferAddedToRollPage from '../../../pages/bookedtoday/transfers/confirmTransferAddedToRoll'

const { prisonTransfer } = expectedArrivals

context('Confirm transfer added To roll', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', [Role.PRISON_RECEPTION])
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubExpectedArrivals', {
      caseLoadId: 'MDI',
      arrivals: [],
    })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [prisonTransfer] })
    cy.task('stubTransfer', {
      caseLoadId: 'MDI',
      prisonNumber: prisonTransfer.prisonNumber,
      transfer: prisonTransfer,
    })
    cy.task('stubConfirmTransfer', prisonTransfer.prisonNumber)
    cy.task('stubRetrieveMultipleBodyScans', [])
    cy.task('stubGetBodyScan', { prisonNumber: 'G0015GD', details: {} })
    cy.signIn()
  })

  it('Can confirm prison transfers', () => {
    {
      ChoosePrisonerPage.goTo().arrivalFrom('PRISON')(1).confirm().click()
      const summaryTransferPage = Page.verifyOnPage(SummaryTransferPage)
      summaryTransferPage.breadcrumbs().should('exist')
      summaryTransferPage.confirmArrival().click()
      const checkTransferPage = Page.verifyOnPage(CheckTransferPage)
      checkTransferPage.choosePrisoner().click()
      Page.verifyOnPage(ChoosePrisonerPage)
    }

    {
      ChoosePrisonerPage.goTo().arrivalFrom('PRISON')(1).confirm().click()
      const summaryTransferPage = Page.verifyOnPage(SummaryTransferPage)
      summaryTransferPage.confirmArrival().click()
      const checkTransferPage = Page.verifyOnPage(CheckTransferPage)
      checkTransferPage.addToRoll().click()
    }

    const confirmTransferAddedToRollPage = Page.verifyOnPage(ConfirmTransferAddedToRollPage)
    confirmTransferAddedToRollPage.addCaseNote(expectedArrivals.prisonTransfer.prisonNumber).exists()
    confirmTransferAddedToRollPage.viewEstablishmentRoll().exists()
    confirmTransferAddedToRollPage.addAnotherToRoll().click()

    Page.verifyOnPage(ChoosePrisonerPage)

    cy.task('getTransferConfirmationRequest', prisonTransfer.prisonNumber).then(request => {
      expect(request).to.deep.equal({ prisonId: 'MDI' })
    })
  })
})
