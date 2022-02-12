import Page from '../../../../pages/page'
import Role from '../../../../../server/authentication/role'
import expectedArrivals from '../../../../mockApis/responses/expectedArrivals'
import ChoosePrisonerPage from '../../../../pages/choosePrisoner'
import ConfirmCourtReturnAddedToRollPage from '../../../../pages/confirmCourtReturnAddedToRoll'
import CheckCourtReturnPage from '../../../../pages/checkCourtReturn'

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

  it('Should go to choose-prisoner page', () => {
    const checkCourtReturnPage = CheckCourtReturnPage.goTo(expectedArrival.id)
    checkCourtReturnPage.addToRoll().click()
    const confirmCourtReturnAddedToRollPage = Page.verifyOnPage(ConfirmCourtReturnAddedToRollPage)
    confirmCourtReturnAddedToRollPage.addAnotherToRoll().click()
    Page.verifyOnPage(ChoosePrisonerPage)
  })

  it('Should display View establishment roll button and Back to Digital Prisons Services link with correct hrefs', () => {
    const checkCourtReturnPage = CheckCourtReturnPage.goTo(expectedArrival.id)
    checkCourtReturnPage.addToRoll().click()
    const confirmCourtReturnAddedToRollPage = Page.verifyOnPage(ConfirmCourtReturnAddedToRollPage)

    confirmCourtReturnAddedToRollPage
      .viewEstablishmentRoll()
      .should('contain', 'View establishment roll')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://digital-dev.prison.service.justice.gov.uk/establishment-roll')
      })
    confirmCourtReturnAddedToRollPage
      .backToDigitalPrisonServices()
      .should('contain', 'Back to Digital Prison Services')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://digital-dev.prison.service.justice.gov.uk')
      })
  })
})
