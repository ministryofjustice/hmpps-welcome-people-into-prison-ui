import Page from '../pages/page'
import HomePage from '../pages/homePage'
import ChoosePrisonerPage from '../pages/bookedtoday/choosePrisoner'
import TemporaryAbsencesPage from '../pages/temporaryabsences/temporaryAbsences'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'

context('A user can view the home page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubExpectedArrivals', {
      caseLoadId: 'MDI',
      arrivals: [expectedArrivals.court.current],
    })
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

    homePage.arrivalsTitle().contains('Prisoners booked to arrive today')
    homePage.returnFromTemporaryAbsenceTitle().contains('Prisoners returning from temporary absence')
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
})
