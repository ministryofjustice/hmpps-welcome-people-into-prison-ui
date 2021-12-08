import Page from '../pages/page'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'
import ChoosePrisonerPage from '../pages/choosePrisoner'
import CheckTransferPage from '../pages/checkTransfer'
import ConfirmTransferAddedToRollPage from '../pages/confirmTransferAddedToRoll'

context('Confirm transfer added To roll', () => {
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
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [] })
    cy.task('stubTransfer', {
      caseLoadId: 'MDI',
      prisonNumber: expectedArrivals.prisonTransfer.prisonNumber,
      transfer: expectedArrivals.prisonTransfer,
    })
    cy.task('stubConfirmTransfer', expectedArrivals.prisonTransfer.prisonNumber)
    cy.task('stubPrison', 'MDI')
    cy.signIn()
  })

  it('Should go to choose-prisoner page', () => {
    const checkTransferPage = CheckTransferPage.goTo(expectedArrivals.prisonTransfer.prisonNumber)
    checkTransferPage.addToRoll().click()
    const confirmTransferAddedToRollPage = Page.verifyOnPage(ConfirmTransferAddedToRollPage)
    confirmTransferAddedToRollPage.addAnotherToRoll().click()
    Page.verifyOnPage(ChoosePrisonerPage)
  })

  it('Should display View establishment roll button and Back to Digital Prisons Services link with correct hrefs', () => {
    const checkTransferPage = CheckTransferPage.goTo(expectedArrivals.prisonTransfer.prisonNumber)
    checkTransferPage.addToRoll().click()
    const confirmTransferAddedToRollPage = Page.verifyOnPage(ConfirmTransferAddedToRollPage)
    confirmTransferAddedToRollPage
      .viewEstablishmentRoll()
      .should('contain', 'View establishment roll')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://digital-dev.prison.service.justice.gov.uk/establishment-roll')
      })
    confirmTransferAddedToRollPage
      .backToDigitalPrisonServices()
      .should('contain', 'Back to Digital Prison Services')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://digital-dev.prison.service.justice.gov.uk')
      })
  })
})
