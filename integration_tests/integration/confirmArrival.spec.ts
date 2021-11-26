import ConfirmArrivalPage from '../pages/confirmArrival'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'

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

  it('Should contain a full set of correctly formatted move data', () => {
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const confirmArrivalPage = ConfirmArrivalPage.goTo(expectedArrival.id)

    confirmArrivalPage.name().should('contain.text', 'Sam Smith')
    confirmArrivalPage.dob().should('contain.text', '1 February 1970')
    confirmArrivalPage.prisonNumber().should('contain.text', 'G0014GM')
    confirmArrivalPage.pncNumber().should('contain.text', '01/4567A')
    confirmArrivalPage.continue().should('have.attr', 'href', `/prisoners/${expectedArrival.id}/imprisonment-status`)
    confirmArrivalPage.prisonerImage().should('have.attr', 'src', `/prisoner/${expectedArrival.prisonNumber}/image`)
  })

  it('Should not display prison or pnc numbers', () => {
    expectedArrival.prisonNumber = null
    expectedArrival.pncNumber = null

    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const confirmArrivalPage = ConfirmArrivalPage.goTo(expectedArrival.id)
    confirmArrivalPage.prisonNumber().should('not.exist')
    confirmArrivalPage.pncNumber().should('not.exist')
    confirmArrivalPage.prisonerImage().should('have.attr', 'src', '/assets/images/placeholder-image.png')
  })
})
