import ConfirmArrivalPage from '../../../pages/bookedtoday/arrivals/confirmArrival'
import Role from '../../../../server/authentication/role'
import expectedArrivals from '../../../mockApis/responses/expectedArrivals'

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

  it('PER record should contain a full set of correctly formatted move data', () => {
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const confirmArrivalPage = ConfirmArrivalPage.goTo(expectedArrival.id)

    confirmArrivalPage.perName().should('contain.text', 'Sam Smith')
    confirmArrivalPage.perDob().should('contain.text', '1 February 1970')
    confirmArrivalPage.perPrisonNumber().should('contain.text', 'G0014GM')
    confirmArrivalPage.perPncNumber().should('contain.text', '01/4567A')
    confirmArrivalPage.continue().should('have.attr', 'href', `/prisoners/${expectedArrival.id}/sex`)
  })

  it('PER record should not display prison number', () => {
    expectedArrival.prisonNumber = null

    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const confirmArrivalPage = ConfirmArrivalPage.goTo(expectedArrival.id)
    confirmArrivalPage.perPrisonNumber().should('contain.text', '')
  })

  it('PER record should not display pnc number', () => {
    expectedArrival.pncNumber = null

    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const confirmArrivalPage = ConfirmArrivalPage.goTo(expectedArrival.id)
    confirmArrivalPage.perPncNumber().should('contain.text', '')
  })

  it('Existing record should contain a full set of correctly formatted move data', () => {
    expectedArrival.potentialMatches = [
      {
        firstName: 'Sam',
        lastName: 'Smith',
        dateOfBirth: '1970-02-01',
        prisonNumber: 'A1234BC',
        pncNumber: '01/4567A',
      },
    ]

    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const confirmArrivalPage = ConfirmArrivalPage.goTo(expectedArrival.id)

    confirmArrivalPage.existingName().should('contain.text', 'Sam Smith')
    confirmArrivalPage.existingDob().should('contain.text', '1 February 1970')
    confirmArrivalPage.existingPrisonNumber().should('contain.text', 'A1234BC')
    confirmArrivalPage.existingPncNumber().should('contain.text', '01/4567A')
    confirmArrivalPage
      .prisonerImage()
      .should('have.attr', 'src', `/prisoner/${expectedArrival.potentialMatches[0].prisonNumber}/image`)
    confirmArrivalPage.continue().should('have.attr', 'href', `/prisoners/${expectedArrival.id}/sex`)
  })

  it('Existing record should not contain prison number', () => {
    expectedArrival.potentialMatches = [
      {
        firstName: 'Sam',
        lastName: 'Smith',
        dateOfBirth: '1970-02-01',
        pncNumber: '01/4567A',
      },
    ]

    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const confirmArrivalPage = ConfirmArrivalPage.goTo(expectedArrival.id)
    confirmArrivalPage.existingPrisonNumber().should('contain.text', '')
  })
  it('Existing record should not contain pnc number', () => {
    expectedArrival.potentialMatches = [
      {
        firstName: 'Sam',
        lastName: 'Smith',
        dateOfBirth: '1970-02-01',
        prisonNumber: 'A1234BC',
      },
    ]

    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const confirmArrivalPage = ConfirmArrivalPage.goTo(expectedArrival.id)
    confirmArrivalPage.existingPncNumber().should('contain.text', '')
  })
})
