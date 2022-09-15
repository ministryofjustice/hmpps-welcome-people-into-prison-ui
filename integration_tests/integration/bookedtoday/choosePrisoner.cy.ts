import ChoosePrisonerPage from '../../pages/bookedtoday/choosePrisoner'

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
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [expectedArrivals.prisonTransfer] })
    cy.task('stubMissingPrisonerImage')
    cy.task('stubRetrieveMultipleBodyScans', [])
  })

  it("Should display available prisoner info and the 'manually confirm' link", () => {
    cy.task('stubExpectedArrivals', {
      caseLoadId: 'MDI',
      arrivals: [
        expectedArrivals.arrival({
          firstName: 'Mark',
          lastName: 'Prisoner',
          prisonNumber: 'G0016GD',
          pncNumber: null,
          fromLocationType: 'CUSTODY_SUITE',
        }),
        expectedArrivals.arrival({
          firstName: 'John',
          lastName: 'Doe',
          prisonNumber: 'G0013AB',
          pncNumber: '01/3456A',
          fromLocationType: 'COURT',
          potentialMatches: [
            {
              firstName: 'Sam',
              lastName: 'Smith',
              prisonNumber: 'G0013AB',
              arrivalType: 'FROM_COURT',
            },
          ],
        }),
        expectedArrivals.arrival({
          firstName: 'Harry',
          lastName: 'Stanton',
          prisonNumber: null,
          pncNumber: '01/3456A',
          fromLocationType: 'COURT',
        }),
      ],
    })

    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()

    choosePrisonerPage.expectedArrivalsFromCourt(1).should('contain.text', 'Doe, John')
    choosePrisonerPage.prisonNumber(1, 'COURT').should('contain.text', 'G0013AB')
    choosePrisonerPage.pncNumber(1, 'COURT').should('contain.text', '01/3456A')

    choosePrisonerPage.expectedArrivalsFromCourt(2).should('contain.text', 'Stanton, Harry')
    choosePrisonerPage.pncNumber(2, 'COURT').should('contain.text', '01/3456A')
    choosePrisonerPage.prisonNumber(2, 'COURT').should('not.exist')

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

  it("A user can view prisoner's actual image if they are a single match", () => {
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
    choosePrisonerPage.prisonerImage(0).check({ href: '/prisoners/G0014GM/image', alt: 'Smith, Bob' })
  })

  it('A user will see placeholder image if there is no match', () => {
    const arrival = expectedArrivals.arrival({
      fromLocationType: 'COURT',
      prisonNumber: 'G0014GM',
      isCurrentPrisoner: false,
      potentialMatches: [],
    })
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [arrival] })

    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.prisonerImage(0).check({
      href: '/assets/images/placeholder-image.png',
      alt: '',
    })
  })

  it('A user will see placeholder image if there are multiple matches', () => {
    const arrival = expectedArrivals.arrival({
      fromLocationType: 'COURT',
      prisonNumber: 'G0014GM',
      isCurrentPrisoner: false,
      potentialMatches: [
        { ...expectedArrivals.potentialMatch, prisonNumber: 'G0014GM' },
        { ...expectedArrivals.potentialMatch, prisonNumber: 'G0014GM' },
      ],
    })
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [arrival] })

    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.prisonerImage(0).check({
      href: '/assets/images/placeholder-image.png',
      alt: '',
    })
  })

  it('Current bookings from court are processed as court returns', () => {
    const currentCourt = expectedArrivals.arrival({
      fromLocationType: 'COURT',
      isCurrentPrisoner: true,
      potentialMatches: [{ ...expectedArrivals.potentialMatch, arrivalType: 'FROM_COURT' }],
    })

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
    cy.task('stubExpectedArrivals', {
      caseLoadId: 'MDI',
      arrivals: [
        expectedArrivals.arrival({ fromLocationType: 'PRISON' }),
        expectedArrivals.arrival({ fromLocationType: 'COURT' }),
        expectedArrivals.arrival({ fromLocationType: 'CUSTODY_SUITE' }),
      ],
    })
    cy.task('stubSignIn')
    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()

    choosePrisonerPage.arrivalFrom('PRISON')(1).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(1).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().should('not.exist')
    choosePrisonerPage.manuallyConfirmArrival().should('not.exist')
  })

  it('A user can view warnings when too many scans', () => {
    const doNotScanArrival = expectedArrivals.arrival({
      fromLocationType: 'COURT',
      prisonNumber: 'A1234AA',
    })
    const closeToLimitArrival = expectedArrivals.arrival({
      fromLocationType: 'COURT',
      prisonNumber: 'A1234AB',
    })
    const okToScanArrival = expectedArrivals.arrival({
      fromLocationType: 'COURT',
      prisonNumber: 'A1234AC',
    })
    const transfer1 = { ...expectedArrivals.prisonTransfer, prisonNumber: 'A1234AD' }
    const transfer2 = { ...expectedArrivals.prisonTransfer, prisonNumber: 'A1234AE' }

    cy.task('stubRetrieveMultipleBodyScans', [
      {
        prisonNumber: 'A1234AA',
        bodyScanStatus: 'DO_NOT_SCAN',
        numberOfBodyScans: 120,
      },
      {
        prisonNumber: 'A1234AB',
        bodyScanStatus: 'CLOSE_TO_LIMIT',
        numberOfBodyScans: 114,
      },
      {
        prisonNumber: 'A1234AC',
        bodyScanStatus: 'OK_TO_SCAN',
        numberOfBodyScans: 10,
      },
      {
        prisonNumber: 'A1234AD',
        bodyScanStatus: 'OK_TO_SCAN',
        numberOfBodyScans: 43,
      },
      {
        prisonNumber: 'A1234AE',
        bodyScanStatus: 'DO_NOT_SCAN',
        numberOfBodyScans: 170,
      },
    ])

    cy.task('stubExpectedArrivals', {
      caseLoadId: 'MDI',
      arrivals: [doNotScanArrival, closeToLimitArrival, okToScanArrival],
    })

    cy.task('stubTransfers', {
      caseLoadId: 'MDI',
      transfers: [transfer1, transfer2],
    })

    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.doNotScan(1, 'COURT').should('exist')
    choosePrisonerPage.doNotScan(2, 'COURT').should('not.exist')
    choosePrisonerPage.doNotScan(3, 'COURT').should('not.exist')

    choosePrisonerPage.doNotScan(1, 'PRISON').should('not.exist')
    choosePrisonerPage.doNotScan(2, 'PRISON').should('exist')
  })
})
