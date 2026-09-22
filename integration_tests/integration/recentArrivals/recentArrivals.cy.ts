import moment from 'moment'
import Page from '../../pages/page'
import Role from '../../../server/authentication/role'
import RecentArrivalsPage from '../../pages/recentArrivals/recentArrivals'
import RecentArrivalsSearchPage from '../../pages/recentArrivals/recentArrivalsSearch'
import PrisonerSummaryPage from '../../pages/recentArrivals/prisonerSummary'
import recentArrivalsResponse from '../../mockApis/responses/recentArrivals'
import xrayBodyScans from '../../mockApis/responses/xrayBodyScans'

const today = moment().format('YYYY-MM-DD')
const oneDayAgo = moment().subtract(1, 'days').format('YYYY-MM-DD')
const twoDaysAgo = moment().subtract(2, 'days').format('YYYY-MM-DD')

const recentArrivals = recentArrivalsResponse.arrivals({})
const recentArrival = recentArrivalsResponse.arrival({})

context('A user can view all recent arrivals', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', [Role.PRISON_RECEPTION])
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubRecentArrivals', { caseLoadId: 'MDI', recentArrivals })
    cy.task('stubMissingPrisonerImage')
    cy.task('stubBulkGetXrayBodyScans', [xrayBodyScans.doNotScan('A1234AB'), xrayBodyScans.okToScan('G0015GF')])
    cy.task('stubPrisonerDetails', recentArrival)
  })

  it('Should display list of recent arrivals for last three days and handle no arrivals for a day', () => {
    cy.signIn()
    const recentArrivalsPage = RecentArrivalsPage.goTo()

    recentArrivalsPage.recentArrivals(1, today).name().should('contain.text', 'Doe, John')
    recentArrivalsPage.recentArrivals(1, today).prisonNumber().should('contain.text', 'G0015GF')
    recentArrivalsPage.recentArrivals(1, today).dob().should('contain.text', '1 January 1973')
    recentArrivalsPage
      .recentArrivals(1, today)
      .movementDateTime()
      .should('contain.text', `${moment().format('D MMMM YYYY')}, 14:40`)
    recentArrivalsPage.recentArrivals(1, today).location().should('contain.text', 'MDI-1-3-004')
    recentArrivalsPage.recentArrivals(1, today).doNotScan().should('not.exist')
    recentArrivalsPage.noRecentArrivalsOnDay(today).should('not.exist')

    recentArrivalsPage.noRecentArrivalsOnDay(oneDayAgo).should('be.visible')

    recentArrivalsPage.recentArrivals(1, twoDaysAgo).name().should('contain.text', 'Smith, Jim')
    recentArrivalsPage.recentArrivals(1, twoDaysAgo).prisonNumber().should('contain.text', 'A1234AB')
    recentArrivalsPage.recentArrivals(1, twoDaysAgo).dob().should('contain.text', '8 January 1973')
    recentArrivalsPage.recentArrivals(1, twoDaysAgo).doNotScan().should('exist')
    recentArrivalsPage
      .recentArrivals(1, twoDaysAgo)
      .movementDateTime()
      .should('contain.text', `${moment().subtract(2, 'days').format('D MMMM YYYY')}, 13:16`)
    recentArrivalsPage.recentArrivals(1, twoDaysAgo).location().should('contain.text', 'MDI-1-5-119')
    recentArrivalsPage.noRecentArrivalsOnDay(twoDaysAgo).should('not.exist')
  })

  it("A user can view prisoner's actual image", () => {
    cy.task('stubPrisonerImage', { prisonerNumber: 'G0015GF', imageFile: '/test-image.jpeg' })

    cy.signIn()
    const recentArrivalsPage = RecentArrivalsPage.goTo()
    recentArrivalsPage.prisonerImage(0).check({ href: '/prisoners/G0015GF/image', alt: 'Headshot of Doe, John' })
  })

  it('A user can successfully search for a recent arrival', () => {
    cy.signIn()
    const recentArrivalsPage = RecentArrivalsPage.goTo()

    recentArrivalsPage.searchInput().type('Smith')
    cy.task('stubRecentArrivals', {
      caseLoadId: 'MDI',
      recentArrivals: recentArrivalsResponse.arrivals({
        content: [
          recentArrivalsResponse.arrival({
            firstName: 'Jim',
            lastName: 'Smith',
          }),
        ],
      }),
    })
    recentArrivalsPage.searchSubmit().click()

    const recentArrivalsSearchPage = Page.verifyOnPage(RecentArrivalsSearchPage)
    recentArrivalsSearchPage.recentArrivals(1).name().should('contain.text', 'Smith, Jim')

    recentArrivalsSearchPage.searchInput().clear().type('John')
    cy.task('stubRecentArrivals', {
      caseLoadId: 'MDI',
      recentArrivals: recentArrivalsResponse.arrivals({
        content: [
          recentArrivalsResponse.arrival({
            firstName: 'John',
            lastName: 'Doe',
          }),
        ],
      }),
    })
    recentArrivalsPage.searchSubmit().click()
    Page.verifyOnPage(RecentArrivalsSearchPage)
    recentArrivalsSearchPage.recentArrivals(1).name().should('contain.text', 'Doe, John')

    cy.task('stubRecentArrivals', { caseLoadId: 'MDI', recentArrivals })
    recentArrivalsSearchPage.clearSearch().click()
    Page.verifyOnPage(RecentArrivalsPage)
  })

  it('Should display prisoner summary page', () => {
    cy.task('stubGetXrayBodyScan', xrayBodyScans.okToScan(recentArrival.prisonNumber))
    cy.task('stubGetPrisoner', recentArrival.prisonNumber)

    cy.task('stubPrisonerDetails', {
      details: recentArrival,
    })
    cy.signIn()
    const recentArrivalsPage = RecentArrivalsPage.goTo()
    recentArrivalsPage.recentArrivals(1, today).name().click()

    const prisonerSummaryPage = new PrisonerSummaryPage(`${recentArrival.lastName}, ${recentArrival.firstName}`)
    prisonerSummaryPage.checkOnPage()
    prisonerSummaryPage.compliancePanelText().should('not.exist')
  })

  it('Should display correct message when body scan count is close to limit', () => {
    cy.task('stubBulkGetXrayBodyScans', [xrayBodyScans.closeToLimit(recentArrival.prisonNumber)])
    cy.task('stubGetXrayBodyScan', xrayBodyScans.closeToLimit(recentArrival.prisonNumber))
    cy.task('stubGetPrisoner', recentArrival.prisonNumber)

    cy.signIn()
    const recentArrivalsPage = RecentArrivalsPage.goTo()
    recentArrivalsPage.recentArrivals(1, today).name().click()

    const prisonerSummaryPage = new PrisonerSummaryPage(`${recentArrival.lastName}, ${recentArrival.firstName}`)

    prisonerSummaryPage
      .xrayNearingLimitText()
      .should('contain.text', 'Near scan limit')
      .and('contain.text', '2 scans left this year')
  })

  it('Should display correct message when body scan count limit reached', () => {
    cy.task('stubGetXrayBodyScan', xrayBodyScans.doNotScan(recentArrival.prisonNumber))
    cy.task('stubGetPrisoner', recentArrival.prisonNumber)

    cy.signIn()
    const recentArrivalsPage = RecentArrivalsPage.goTo()
    recentArrivalsPage.recentArrivals(1, today).name().click()

    const prisonerSummaryPage = new PrisonerSummaryPage(`${recentArrival.lastName}, ${recentArrival.firstName}`)

    prisonerSummaryPage
      .xrayAtLimitText()
      .should('contain.text', 'Scan limit reached')
      .and('contain.text', 'No more scans allowed this year')
  })

  it('Should display relevant alerts on the arrivals list card', () => {
    cy.task('stubBulkGetXrayBodyScans', [
      xrayBodyScans.withAlert(recentArrival.prisonNumber),
      xrayBodyScans.okToScan('A1234AB'),
    ])

    cy.signIn()
    const recentArrivalsPage = RecentArrivalsPage.goTo()
    recentArrivalsPage.recentArrivals(1, today).doNotScan().should('not.exist')
    cy.get('.dps-alert-status--security').should('contain.text', 'Internal secretor')
  })

  it('Should display legacy NOMIS count info when nomisCount is greater than zero', () => {
    cy.task('stubGetXrayBodyScan', xrayBodyScans.withNomisCount(recentArrival.prisonNumber))
    cy.task('stubGetPrisoner', recentArrival.prisonNumber)

    cy.signIn()
    const recentArrivalsPage = RecentArrivalsPage.goTo()
    recentArrivalsPage.recentArrivals(1, today).name().click()

    const prisonerSummaryPage = new PrisonerSummaryPage(`${recentArrival.lastName}, ${recentArrival.firstName}`)
    prisonerSummaryPage.checkOnPage()
    cy.get('#body-scan').should('contain.text', 'Scan total includes DPS and legacy records')
  })
})

context('XRBS scan card links', () => {
  const navigateToSummary = () => {
    const recentArrivalsPage = RecentArrivalsPage.goTo()
    recentArrivalsPage.recentArrivals(1, today).name().click()
    return new PrisonerSummaryPage(`${recentArrival.lastName}, ${recentArrival.firstName}`)
  }

  context('when user has XRBS permissions', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', ['ROLE_PRISON_RECEPTION', 'ROLE_PRISON', 'ROLE_DPS_APPLICATION_DEVELOPER'] as never)
      cy.task('stubPrison', 'MDI')
      cy.task('stubAuthUser')
      cy.task('stubUserCaseLoads')
      cy.task('stubRecentArrivals', { caseLoadId: 'MDI', recentArrivals })
      cy.task('stubMissingPrisonerImage')
      cy.task('stubBulkGetXrayBodyScans', [xrayBodyScans.doNotScan(recentArrival.prisonNumber)])
      cy.task('stubPrisonerDetails', recentArrival)
      cy.task('stubGetXrayBodyScan', xrayBodyScans.doNotScan(recentArrival.prisonNumber))
      cy.task('stubGetPrisoner', recentArrival.prisonNumber)
      cy.signIn()
    })

    it('Should display XRBS scan links', () => {
      const prisonerSummaryPage = navigateToSummary()
      prisonerSummaryPage.checkOnPage()
      prisonerSummaryPage.xrayAtLimitText().should('contain.text', 'Scan limit reached')
      cy.get('a').contains('Check body scan details').should('have.attr', 'href').and('include', '/scan-overview')
      cy.get('a').contains('Record a new scan').should('have.attr', 'href').and('include', '/record-scan')
    })
  })

  context('when user does not have XRBS permissions', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', [Role.PRISON_RECEPTION])
      cy.task('stubPrison', 'MDI')
      cy.task('stubAuthUser')
      cy.task('stubUserCaseLoads')
      cy.task('stubRecentArrivals', { caseLoadId: 'MDI', recentArrivals })
      cy.task('stubMissingPrisonerImage')
      cy.task('stubBulkGetXrayBodyScans', [xrayBodyScans.doNotScan(recentArrival.prisonNumber)])
      cy.task('stubPrisonerDetails', recentArrival)
      cy.task('stubGetXrayBodyScan', xrayBodyScans.doNotScan(recentArrival.prisonNumber))
      cy.task('stubGetPrisoner', recentArrival.prisonNumber)
      cy.signIn()
    })

    it('Should display fallback scan links', () => {
      const prisonerSummaryPage = navigateToSummary()
      prisonerSummaryPage.checkOnPage()
      prisonerSummaryPage.xrayAtLimitText().should('contain.text', 'Scan limit reached')
      cy.get('a').contains('Check body scan details').should('have.attr', 'href').and('include', '/x-ray-body-scans')
      cy.get('a').contains('Record a new scan').should('have.attr', 'href').and('include', '/record-body-scan')
    })
  })
})
