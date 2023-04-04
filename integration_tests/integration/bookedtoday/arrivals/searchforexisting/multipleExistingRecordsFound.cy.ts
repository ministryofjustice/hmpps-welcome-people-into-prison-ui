import ChoosePrisonerPage from '../../../../pages/bookedtoday/choosePrisoner'
import MultipleExistingRecordsFoundPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/multipleExistingRecordsFound'
import SearchForExistingPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/search/searchForExisting'
import ReviewDetailsPage from '../../../../pages/bookedtoday/arrivals/reviewDetails'
import ImprisonmentStatus from '../../../../pages/bookedtoday/arrivals/confirmArrival/imprisonmentStatus'

import Page from '../../../../pages/page'
import Role from '../../../../../server/authentication/role'
import expectedArrivals from '../../../../mockApis/responses/expectedArrivals'
import ChangePrisonNumberPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/search/changePrisonNumber'
import ChangePncNumberPage from '../../../../pages/bookedtoday/arrivals/searchforexisting/search/changePncNumber'
import PrisonerSummaryMoveOnlyPage from '../../../../pages/bookedtoday/prisonerSummaryMoveOnly'

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

context('Multiple existing records', () => {
  beforeEach(() => {
    cy.task('resetRedis')
    cy.task('reset')
    cy.task('stubSignIn', [Role.PRISON_RECEPTION])
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
    cy.task('stubRetrieveMultipleBodyScans', [])
    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()
    const prisonerSummaryWithRecordPage = new PrisonerSummaryMoveOnlyPage(`${arrival.lastName}, ${arrival.firstName}`)
    prisonerSummaryWithRecordPage.checkOnPage()
    prisonerSummaryWithRecordPage.confirmArrival().click()
  })

  it('Processing multiple matches', () => {
    cy.task('stubPrisonerDetails', { ...matchedRecords[0], arrivalType: 'NEW_BOOKING' })

    const searchForExistingPage = Page.verifyOnPage(SearchForExistingPage)
    searchForExistingPage.prisonNumber.change().click()

    const changePrisonNumberPage = Page.verifyOnPage(ChangePrisonNumberPage)
    changePrisonNumberPage.prisonNumber().clear().type('A1234AA')
    changePrisonNumberPage.save().click()
    searchForExistingPage.pnc.change().click()

    const changePncNumberPage = Page.verifyOnPage(ChangePncNumberPage)
    changePncNumberPage.pnc().clear().type('01/23456A')
    changePncNumberPage.save().click()
    searchForExistingPage.search().click()

    const multipleExistingRecordsFoundPage = Page.verifyOnPage(MultipleExistingRecordsFoundPage)
    const arrival = multipleExistingRecordsFoundPage.arrival()
    arrival.fieldName('prisoner-name').should('contain', 'Bob Smith')
    arrival.fieldName('dob').should('contain', '21 November 1972')
    arrival.fieldName('prison-number').should('contain', 'A1234AA')
    arrival.fieldName('pnc-number').should('contain', '01/23456A')

    {
      const match = multipleExistingRecordsFoundPage.chooseMatch(1)
      match.fieldName('prisoner-name').should('contain', 'Sam Smith')
      match.fieldName('dob').should('contain', '1 February 1970')
      match.fieldName('prison-number').should('contain', 'G0014GM')
      match.fieldName('pnc-number').should('contain', '01/1111A')
      match.fieldName('cro-number').should('contain', '01/0000A')
    }
    {
      const match = multipleExistingRecordsFoundPage.chooseMatch(2)
      match.fieldName('prisoner-name').should('contain', 'Sammy Smith')
      match.fieldName('dob').should('contain', '1 February 1970')
    }
    multipleExistingRecordsFoundPage.prisonerImage().check({ href: `/prisoners/G0014GM/image`, alt: 'Smith, Sam' })

    multipleExistingRecordsFoundPage.continue().click()
    multipleExistingRecordsFoundPage.hasError('Select an existing record or search using different details')

    multipleExistingRecordsFoundPage.match(1).click()
    multipleExistingRecordsFoundPage.continue().click()
    Page.verifyOnPage(ImprisonmentStatus)
  })

  it('should allow a new search', () => {
    const multipleExistingRecordsFoundPage = MultipleExistingRecordsFoundPage.goTo('11111-11111')
    multipleExistingRecordsFoundPage.searchAgain().click()
    Page.verifyOnPage(SearchForExistingPage)
  })

  it('Should allow navigation to create a new record', () => {
    const multipleExistingRecordsFoundPage = MultipleExistingRecordsFoundPage.goTo('11111-11111')
    multipleExistingRecordsFoundPage.createNewDetailsReveal().click()
    multipleExistingRecordsFoundPage.createNew().click()

    const reviewDetailsPage = Page.verifyOnPage(ReviewDetailsPage)
    reviewDetailsPage.name.value().should('contain.text', 'Bob Smith')
  })
})
