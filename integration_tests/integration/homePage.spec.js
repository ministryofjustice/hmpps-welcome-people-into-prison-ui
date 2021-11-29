import Page from '../pages/page'
import HomePage from '../pages/homePage'
import ChoosePrisonerPage from '../pages/choosePrisoner'
import TemporaryAbsencesPage from '../pages/temporaryAbsences'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'

context('A user can view the home page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubAuthUser')
    cy.task('stubExpectedArrivals', {
      caseLoadId: 'MDI',
      arrivals: [
        expectedArrivals.custodySuite.current,
        expectedArrivals.custodySuite.notCurrent,
        expectedArrivals.custodySuite.notMatched,
        expectedArrivals.other,
        expectedArrivals.court.current,
        expectedArrivals.court.notCurrent,
        expectedArrivals.court.notMatched,
      ],
    })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [expectedArrivals.prisonTransfer] })
    cy.task('stubTemporaryAbsences', 'MDI')
    cy.task('stubMissingPrisonerImage')

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