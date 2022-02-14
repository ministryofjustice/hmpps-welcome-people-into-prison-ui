import ExistingRecordPage from '../../../pages/bookedtoday/arrivals/existingRecord'
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
    const existingRecordPage = ExistingRecordPage.goTo(expectedArrival.id)

    existingRecordPage.perName().should('contain.text', 'Sam Smith')
    existingRecordPage.perDob().should('contain.text', '1 February 1970')
    existingRecordPage.perPrisonNumber().should('contain.text', 'G0014GM')
    existingRecordPage.perPncNumber().should('contain.text', '01/4567A')
    existingRecordPage.continue().should('have.attr', 'href', `/prisoners/${expectedArrival.id}/sex`)
  })

  it('PER record should not display prison number', () => {
    expectedArrival.prisonNumber = null

    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const existingRecordPage = ExistingRecordPage.goTo(expectedArrival.id)
    existingRecordPage.perPrisonNumber().should('contain.text', '')
  })

  it('PER record should not display pnc number', () => {
    expectedArrival.pncNumber = null

    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const existingRecordPage = ExistingRecordPage.goTo(expectedArrival.id)
    existingRecordPage.perPncNumber().should('contain.text', '')
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
    const existingRecordPage = ExistingRecordPage.goTo(expectedArrival.id)

    existingRecordPage.existingName().should('contain.text', 'Sam Smith')
    existingRecordPage.existingDob().should('contain.text', '1 February 1970')
    existingRecordPage.existingPrisonNumber().should('contain.text', 'A1234BC')
    existingRecordPage.existingPncNumber().should('contain.text', '01/4567A')
    existingRecordPage
      .prisonerImage()
      .should('have.attr', 'src', `/prisoner/${expectedArrival.potentialMatches[0].prisonNumber}/image`)
    existingRecordPage.continue().should('have.attr', 'href', `/prisoners/${expectedArrival.id}/sex`)
  })

  it('Existing record should not contain prison number', () => {
    expectedArrival.potentialMatches = [
      {
        firstName: 'Sam',
        lastName: 'Smith',
        dateOfBirth: '1970-02-01',
        pncNumber: '01/4567A',
        prisonNumber: undefined,
      },
    ]

    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const existingRecordPage = ExistingRecordPage.goTo(expectedArrival.id)
    existingRecordPage.existingPrisonNumber().should('contain.text', '')
  })
  it('Existing record should not contain pnc number', () => {
    expectedArrival.potentialMatches = [
      {
        firstName: 'Sam',
        lastName: 'Smith',
        dateOfBirth: '1970-02-01',
        prisonNumber: 'A1234BC',
        pncNumber: undefined,
      },
    ]

    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const existingRecordPage = ExistingRecordPage.goTo(expectedArrival.id)
    existingRecordPage.existingPncNumber().should('contain.text', '')
  })
})
