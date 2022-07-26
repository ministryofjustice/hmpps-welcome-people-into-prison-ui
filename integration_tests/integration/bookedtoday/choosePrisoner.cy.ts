import ChoosePrisonerPage from '../../pages/bookedtoday/choosePrisoner'
import FeatureNotAvailablePage from '../../pages/featureNotAvailable'

import SingleMatchingRecordFoundPage from '../../pages/bookedtoday/arrivals/autoMatchingRecords/singleMatchingRecordFound'
import CheckCourtReturnPage from '../../pages/bookedtoday/arrivals/courtreturns/checkCourtReturn'
import Page from '../../pages/page'
import Role from '../../../server/authentication/role'
import expectedArrivals from '../../mockApis/responses/expectedArrivals'
import NoMatchingRecordsFoundPage from '../../pages/bookedtoday/arrivals/autoMatchingRecords/noMatchingRecordsFound'
import ReviewDetailsPage from '../../pages/bookedtoday/arrivals/reviewDetails'

context('Choose Prisoner', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubExpectedArrivals', {
      caseLoadId: 'MDI',
      arrivals: [
        expectedArrivals.custodySuite.current,
        expectedArrivals.custodySuite.notCurrent,
        expectedArrivals.custodySuite.notMatched,
        expectedArrivals.court.current,
        expectedArrivals.court.notCurrent,
        expectedArrivals.court.notMatched,
      ],
    })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [expectedArrivals.prisonTransfer] })
    cy.task('stubMissingPrisonerImage')
  })

  it("Should display available prisoner info and the 'manually confirm' link", () => {
    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()

    choosePrisonerPage.expectedArrivalsFromCourt(1).should('contain.text', 'Doe, John')
    choosePrisonerPage.prisonNumber(1, 'COURT').should('contain.text', 'G0013AB')
    choosePrisonerPage.pncNumber(1, 'COURT').should('contain.text', '01/3456A')

    choosePrisonerPage.expectedArrivalsFromCourt(3).should('contain.text', 'Stanton, Harry')
    choosePrisonerPage.pncNumber(3, 'COURT').should('contain.text', '01/3456A')
    choosePrisonerPage.prisonNumber(3, 'COURT').should('not.exist')

    choosePrisonerPage.expectedArrivalsFromCustodySuite(1).should('contain.text', 'Prisoner, Mark')
    choosePrisonerPage.prisonNumber(1, 'CUSTODY_SUITE').should('contain.text', 'G0016GD')
    choosePrisonerPage.pncNumber(1, 'CUSTODY_SUITE').should('not.exist')

    choosePrisonerPage.expectedArrivalsFromAnotherEstablishment(1).should('contain.text', 'Offender, Karl')
    choosePrisonerPage.manuallyConfirmArrival().should('exist')
  })

  it('Should handle no expected arrivals', () => {
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [] })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [] })
    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.noExpectedArrivalsFromCourt().should('be.visible')
    choosePrisonerPage.noExpectedArrivalsFromCustodySuite().should('be.visible')
    choosePrisonerPage.noExpectedArrivalsFromAnotherEstablishment().should('be.visible')
  })

  it("A user can view prisoner's actual image", () => {
    const arrival = expectedArrivals.arrival({
      fromLocationType: 'COURT',
      prisonNumber: 'G0014GM',
      isCurrentPrisoner: false,
      potentialMatches: [{ ...expectedArrivals.potentialMatch, prisonNumber: 'G0014GM' }],
    })
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [arrival] })
    cy.task('stubExpectedArrival', arrival)
    cy.task('stubPrisonerImage', { prisonerNumber: 'G0014GM', imageFile: '/placeholder-image.png' })

    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage
      .prisonerImage(0)
      .should('be.visible')
      .should('have.attr', 'src')
      .then(src => {
        expect(src).equal('/prisoners/G0014GM/image')
      })

    choosePrisonerPage
      .prisonerImage(0)
      .should('have.attr', 'alt')
      .then(altText => {
        expect(altText).equal('Smith, Bob')
      })
  })

  it('A user will see placeholder image as there is no prisoner number', () => {
    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage
      .prisonerImage(2)
      .should('be.visible')
      .should('have.attr', 'src')
      .then(src => {
        expect(src).equal('/assets/images/placeholder-image.png')
      })

    choosePrisonerPage
      .prisonerImage(2)
      .should('have.attr', 'alt')
      .then(altText => {
        expect(altText).equal('Stanton, Harry')
      })
  })

  it('Current bookings from court are processed as court returns', () => {
    const currentCourt = expectedArrivals.arrival({ fromLocationType: 'COURT', isCurrentPrisoner: true })

    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [currentCourt] })
    cy.task('stubExpectedArrival', expectedArrivals.arrival(currentCourt))
    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()

    Page.verifyOnPage(CheckCourtReturnPage)
  })

  it('new bookings from court with no match', () => {
    const arrival = expectedArrivals.arrival({
      fromLocationType: 'COURT',
      isCurrentPrisoner: false,
      potentialMatches: [],
    })
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [arrival] })
    cy.task('stubExpectedArrival', arrival)
    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()

    const noMatchingRecordsFoundPage = Page.verifyOnPage(NoMatchingRecordsFoundPage)
    noMatchingRecordsFoundPage.perName().should('contain.text', 'Bob Smith')
    noMatchingRecordsFoundPage.perDob().should('contain.text', '1 January 1970')
    noMatchingRecordsFoundPage.perPncNumber().should('contain.text', '01/2345A')
    noMatchingRecordsFoundPage.continue().click()

    Page.verifyOnPage(ReviewDetailsPage)
  })

  it('new bookings from court with match', () => {
    const arrival = expectedArrivals.arrival({
      fromLocationType: 'COURT',
      isCurrentPrisoner: false,
      potentialMatches: [expectedArrivals.potentialMatch],
    })
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [arrival] })
    cy.task('stubExpectedArrival', arrival)
    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()

    Page.verifyOnPage(SingleMatchingRecordFoundPage)
  })

  it('Current bookings from police custody suite are not processable', () => {
    const arrival = expectedArrivals.arrival({ fromLocationType: 'CUSTODY_SUITE', isCurrentPrisoner: true })
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [arrival] })
    cy.task('stubExpectedArrival', arrival)
    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(1).confirm().click()

    Page.verifyOnPage(FeatureNotAvailablePage)
  })

  it('new bookings from police custody suite with no match', () => {
    const arrival = expectedArrivals.arrival({
      fromLocationType: 'CUSTODY_SUITE',
      isCurrentPrisoner: false,
      potentialMatches: [],
    })
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [arrival] })
    cy.task('stubExpectedArrival', arrival)
    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(1).confirm().click()

    Page.verifyOnPage(NoMatchingRecordsFoundPage)
  })

  it('new bookings from police custody suite with match', () => {
    const arrival = expectedArrivals.arrival({
      fromLocationType: 'CUSTODY_SUITE',
      isCurrentPrisoner: false,
      potentialMatches: [expectedArrivals.potentialMatch],
    })
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [arrival] })
    cy.task('stubExpectedArrival', arrival)
    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(1).confirm().click()

    Page.verifyOnPage(SingleMatchingRecordFoundPage)
  })

  it('No links shown if not a reception user', () => {
    cy.task('stubSignIn')
    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()

    choosePrisonerPage.arrivalFrom('PRISON')(1).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(1).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(2).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(3).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('COURT')(2).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('COURT')(3).confirm().should('not.exist')
    choosePrisonerPage.manuallyConfirmArrival().should('not.exist')
  })
})
