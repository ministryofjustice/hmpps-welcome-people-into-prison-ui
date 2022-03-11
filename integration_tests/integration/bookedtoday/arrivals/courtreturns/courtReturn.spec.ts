import Page from '../../../../pages/page'
import Role from '../../../../../server/authentication/role'
import expectedArrivals from '../../../../mockApis/responses/expectedArrivals'
import ChoosePrisonerPage from '../../../../pages/bookedtoday/choosePrisoner'
import ConfirmCourtReturnAddedToRollPage from '../../../../pages/bookedtoday/arrivals/courtreturns/confirmCourtReturnAddedToRoll'
import CheckCourtReturnPage from '../../../../pages/bookedtoday/arrivals/courtreturns/checkCourtReturn'

const expectedArrival = expectedArrivals.court.current

context('Confirm court return added To roll', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubExpectedArrival', expectedArrival)
    cy.task('stubExpectedArrivals', {
      caseLoadId: 'MDI',
      arrivals: [expectedArrival],
    })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [] })
    cy.task('stubConfirmCourtReturn', expectedArrival.id)
    cy.signIn()
  })

  it('Can back out of confirmation', () => {
    const checkCourtReturnPage = ChoosePrisonerPage.selectPrisoner(expectedArrival.id, CheckCourtReturnPage)
    checkCourtReturnPage.returnToArrivalsList().click()
    Page.verifyOnPage(ChoosePrisonerPage)
  })

  it('Can confirm court arrivals', () => {
    const checkCourtReturnPage = ChoosePrisonerPage.selectPrisoner(expectedArrival.id, CheckCourtReturnPage)

    checkCourtReturnPage.addToRoll().click()

    const confirmCourtReturnAddedToRollPage = Page.verifyOnPage(ConfirmCourtReturnAddedToRollPage)

    confirmCourtReturnAddedToRollPage.viewEstablishmentRoll().exists()
    confirmCourtReturnAddedToRollPage.backToDigitalPrisonServices().exists()
    confirmCourtReturnAddedToRollPage.addAnotherToRoll().click()

    Page.verifyOnPage(ChoosePrisonerPage)

    cy.task('getCourtReturnConfirmationRequest', expectedArrival.id).then(request => {
      expect(request).to.deep.equal({ prisonId: 'MDI', prisonNumber: 'A1234BC' })
    })
  })
})
