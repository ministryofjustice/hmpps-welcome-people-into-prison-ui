import Page from '../pages/page'
import HomePage from '../pages/homePage'
import ChoosePrisonerPage from '../pages/bookedtoday/choosePrisoner'
import TemporaryAbsencesPage from '../pages/temporaryabsences/temporaryAbsences'
import RecentArrivalsPage from '../pages/recentArrivals/recentArrivals'
import recentArrivalsResponse from '../mockApis/responses/recentArrivals'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'

const recentArrivals = recentArrivalsResponse.arrivals({})

context('A user can view the home page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', [Role.PRISON_RECEPTION])
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

  it('should redirect a user to the home page', () => {
    cy.visit('/')

    Page.verifyOnPage(HomePage)
  })

  it('A user can view the home page', () => {
    const homePage = Page.verifyOnPage(HomePage)

    homePage.arrivalsTitle().contains('People booked to arrive today')
    homePage.returnFromTemporaryAbsenceTitle().contains('People returning from temporary absence')
    homePage.recentArrivalsTitle().contains('Recent arrivals')
    homePage.managementReportTitle().contains('Management reporting').should('not.exist')
  })

  it('A user is taken to the choose prisoner page', () => {
    const homePage = Page.verifyOnPage(HomePage)
    homePage.arrivalsTitle().click()
    Page.verifyOnPage(ChoosePrisonerPage)
  })
  it('A user is taken to the temporary absences page', () => {
    const homePage = Page.verifyOnPage(HomePage)
    homePage.returnFromTemporaryAbsenceTitle().click()
    Page.verifyOnPage(TemporaryAbsencesPage)
  })

  it('A user is taken to the recent arrivals page', () => {
    const homePage = Page.verifyOnPage(HomePage)
    homePage.recentArrivalsTitle().click()
    Page.verifyOnPage(RecentArrivalsPage)
  })

  it('There is a valid  DPS homepage breadcrumb', () => {
    const homePage = Page.verifyOnPage(HomePage)
    homePage
      .dpsLink()
      .should('contain', 'Digital Prison Services')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://dps-dev.prison.service.justice.gov.uk')
      })
  })
})
