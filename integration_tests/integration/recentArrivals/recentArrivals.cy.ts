import moment from 'moment'
import Page from '../../pages/page'
import Role from '../../../server/authentication/role'
import RecentArrivalsPage from '../../pages/recentArrivals/recentArrivals'
import RecentArrivalsSearchPage from '../../pages/recentArrivals/recentArrivalsSearch'
import recentArrivalsResponse from '../../mockApis/responses/recentArrivals'

const today = moment().format('YYYY-MM-DD')
const oneDayAgo = moment().subtract(1, 'days').format('YYYY-MM-DD')
const twoDaysAgo = moment().subtract(2, 'days').format('YYYY-MM-DD')

const recentArrivals = recentArrivalsResponse.arrivals({})

context('A user can view all recent arrivals', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubRecentArrivals', { caseLoadId: 'MDI', recentArrivals })
    cy.task('stubMissingPrisonerImage')
    cy.task('stubRetrieveMultipleBodyScans', [
      {
        prisonNumber: 'A1234AB',
        bodyScanStatus: 'DO_NOT_SCAN',
        numberOfBodyScans: 120,
      },
      { prisonNumber: 'G0015GF', bodyScanStatus: 'OK_TO_SCAN', numberOfBodyScans: 1 },
    ])
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
    recentArrivalsPage.noRecentArrivlsOnDay(today).should('not.exist')

    recentArrivalsPage.noRecentArrivlsOnDay(oneDayAgo).should('be.visible')

    recentArrivalsPage.recentArrivals(1, twoDaysAgo).name().should('contain.text', 'Smith, Jim')
    recentArrivalsPage.recentArrivals(1, twoDaysAgo).prisonNumber().should('contain.text', 'A1234AB')
    recentArrivalsPage.recentArrivals(1, twoDaysAgo).dob().should('contain.text', '8 January 1973')
    recentArrivalsPage.recentArrivals(1, twoDaysAgo).doNotScan().should('exist')
    recentArrivalsPage
      .recentArrivals(1, twoDaysAgo)
      .movementDateTime()
      .should('contain.text', `${moment().subtract(2, 'days').format('D MMMM YYYY')}, 13:16`)
    recentArrivalsPage.recentArrivals(1, twoDaysAgo).location().should('contain.text', 'MDI-1-5-119')
    recentArrivalsPage.noRecentArrivlsOnDay(twoDaysAgo).should('not.exist')
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
})
