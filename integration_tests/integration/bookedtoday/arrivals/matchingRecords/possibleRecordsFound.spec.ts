import ChoosePrisonerPage from '../../../../pages/bookedtoday/choosePrisoner'
import PossibleRecordsFoundPage from '../../../../pages/bookedtoday/arrivals/matchingRecords/possibleRecordsFound'
import SearchForExistingPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/searchForExisting'
import ImprisonmentStatus from '../../../../pages/bookedtoday/arrivals/imprisonmentStatus'

import Page from '../../../../pages/page'
import Role from '../../../../../server/authentication/role'
import expectedArrivals from '../../../../mockApis/responses/expectedArrivals'

const matchedRecords = [
  {
    firstName: 'Sam',
    lastName: 'Smith',
    dateOfBirth: '1970-02-01',
    prisonNumber: 'G0014GM',
    pncNumber: '01/1111A',
    croNumber: '01/0000A',
    sex: 'MALE',
  },
  {
    firstName: 'Sammy',
    lastName: 'Smith',
    dateOfBirth: '1970-02-01',
    sex: 'MALE',
  },
]

context('Possible existing records', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [] })
    cy.task('stubMissingPrisonerImage')
    const arrival = expectedArrivals.arrival({
      fromLocationType: 'COURT',
      isCurrentPrisoner: false,
      dateOfBirth: '1972-11-21',
      pncNumber: null,
      prisonNumber: null,
    })
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [arrival] })
    cy.task('stubExpectedArrival', arrival)
    cy.task('stubMatchedRecords', matchedRecords)
    cy.task('stubImprisonmentStatus')
    cy.task('stubPrisonerDetails', matchedRecords[0])
    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()
  })

  it('should display page contents', () => {
    const possibleRecordsFoundPage = PossibleRecordsFoundPage.goTo('11111-11111')
    possibleRecordsFoundPage.perElement('prisoner-name').should('contain', 'Bob Smith')
    possibleRecordsFoundPage.perElement('dob').should('contain', '21 November 1972')
    possibleRecordsFoundPage.matchingElement('1-prisoner-name').should('contain', 'Sam Smith')
    possibleRecordsFoundPage.matchingElement('1-dob').should('contain', '1 February 1970')
    possibleRecordsFoundPage.matchingElement('1-prison-number').should('contain', 'G0014GM')
    possibleRecordsFoundPage.matchingElement('1-pnc-number').should('contain', '01/1111A')
    possibleRecordsFoundPage.matchingElement('1-cro-number').should('contain', '01/0000A')
    possibleRecordsFoundPage.matchingElement('2-prisoner-name').should('contain', 'Sammy Smith')
    possibleRecordsFoundPage.matchingElement('2-dob').should('contain', '1 February 1970')
    possibleRecordsFoundPage.prisonerImage().should('have.attr', 'src', `/prisoner/G0014GM/image`)
  })

  it('should allow a new search', () => {
    const possibleRecordsFoundPage = PossibleRecordsFoundPage.goTo('11111-11111')
    possibleRecordsFoundPage.searchAgainLink().click()
    Page.verifyOnPage(SearchForExistingPage)
  })
  it('should display error messages', () => {
    const possibleRecordsFoundPage = PossibleRecordsFoundPage.goTo('11111-11111')
    possibleRecordsFoundPage.continue().click()
    possibleRecordsFoundPage
      .errorSummary()
      .should('contain', 'Select an existing record or search using different details')
    possibleRecordsFoundPage
      .errorMessage()
      .should('contain', 'Select an existing record or search using different details')
  })
  it('should progress to next page if no errors', () => {
    const possibleRecordsFoundPage = PossibleRecordsFoundPage.goTo('11111-11111')
    possibleRecordsFoundPage.radioButtonOne().check()
    possibleRecordsFoundPage.continue().click()
    Page.verifyOnPage(ImprisonmentStatus)
  })
})
