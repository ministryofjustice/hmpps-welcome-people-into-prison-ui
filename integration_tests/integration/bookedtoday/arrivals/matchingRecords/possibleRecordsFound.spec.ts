import ChoosePrisonerPage from '../../../../pages/bookedtoday/choosePrisoner'
import PossibleRecordsFoundPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/possibleRecordsFound'
import SearchForExistingPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/search/searchForExisting'
import ImprisonmentStatus from '../../../../pages/bookedtoday/arrivals/confirmArrival/imprisonmentStatus'

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
    const arrival = possibleRecordsFoundPage.arrival()
    arrival.fieldName('prisoner-name').should('contain', 'Bob Smith')
    arrival.fieldName('dob').should('contain', '21 November 1972')

    let match
    match = possibleRecordsFoundPage.chooseMatch(1)
    match.fieldName('prisoner-name').should('contain', 'Sam Smith')
    match.fieldName('dob').should('contain', '1 February 1970')
    match.fieldName('prison-number').should('contain', 'G0014GM')
    match.fieldName('pnc-number').should('contain', '01/1111A')
    match.fieldName('cro-number').should('contain', '01/0000A')

    match = possibleRecordsFoundPage.chooseMatch(2)
    match.fieldName('prisoner-name').should('contain', 'Sammy Smith')
    match.fieldName('dob').should('contain', '1 February 1970')

    possibleRecordsFoundPage.prisonerImage().should('have.attr', 'src', `/prisoner/G0014GM/image`)
  })

  it('should allow a new search', () => {
    const possibleRecordsFoundPage = PossibleRecordsFoundPage.goTo('11111-11111')
    possibleRecordsFoundPage.searchAgain().click()
    Page.verifyOnPage(SearchForExistingPage)
  })
  it('should display error messages', () => {
    const possibleRecordsFoundPage = PossibleRecordsFoundPage.goTo('11111-11111')
    possibleRecordsFoundPage.continue().click()
    possibleRecordsFoundPage.hasError('Select an existing record or search using different details')
  })
  it('should progress to next page if no errors', () => {
    const possibleRecordsFoundPage = PossibleRecordsFoundPage.goTo('11111-11111')
    possibleRecordsFoundPage.match(1).click()
    possibleRecordsFoundPage.continue().click()
    Page.verifyOnPage(ImprisonmentStatus)
  })
})
