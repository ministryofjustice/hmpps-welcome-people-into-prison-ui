import Page from '../pages/page'
import HomePage from '../pages/homePage'
import ChoosePrisonerPage from '../pages/bookedtoday/choosePrisoner'
import TemporaryAbsencesPage from '../pages/temporaryabsences/temporaryAbsences'
import RecentArrivalsPage from '../pages/recentArrivals/recentArrivals'
import recentArrivalsResponse from '../mockApis/responses/recentArrivals'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'

const recentArrivals = recentArrivalsResponse.arrivals({})

context('A user can view the home page with management reporting', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', [Role.REPORT_USER])
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubExpectedArrivals', {
      caseLoadId: 'MDI',
      arrivals: [expectedArrivals.court.current],
    })
    cy.task('stubRecentArrivals', { caseLoadId: 'MDI', recentArrivals })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [expectedArrivals.prisonTransfer] })
    cy.task('stubTemporaryAbsences', 'MDI')
    cy.task('stubMissingPrisonerImage')
    cy.task('stubRetrieveMultipleBodyScans', [])

    cy.signIn()
  })

  it('A user with report view can view the management report page', () => {
    const homePage = Page.verifyOnPage(HomePage)
    homePage.managementReportTitle().contains('Management reporting')
  })
})
