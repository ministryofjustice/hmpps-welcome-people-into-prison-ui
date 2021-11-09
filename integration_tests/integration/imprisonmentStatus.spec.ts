import Page from '../pages/page'
import ImprisonmentStatusPage from '../pages/imprisonmentStatus'
import MovementReasonsPage from '../pages/movementReasons'
import CheckAnswersPage from '../pages/checkAnswers'
import Role from '../../server/authentication/role'

const expectedArrival = {
  id: '00000-11111',
  firstName: 'Harry',
  lastName: 'Stanton',
  dateOfBirth: '1961-01-29',
  prisonNumber: 'A1234AB',
  pncNumber: '01/3456A',
  date: '2021-09-01',
  fromLocation: 'Reading',
  fromLocationType: 'COURT',
}
context('Imprisonment status', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubAuthUser')
    cy.task('stubExpectedArrivals', 'MDI')
    cy.task('stubExpectedArrival', expectedArrival)
    cy.task('stubImprisonmentStatus')
    cy.task('stubMissingPrisonerImage')
    cy.task('stubPrison', 'MDI')
  })

  it("Should display prisoner's name", () => {
    cy.signIn()
    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
    imprisonmentStatusPage.prisonerName().should('contain.text', 'Harry Stanton')
  })

  it('Selecting On remand takes user straight through to check answers', () => {
    cy.signIn()
    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
    imprisonmentStatusPage.onRemandRadioButton().click()
    imprisonmentStatusPage.continue().click()
    Page.verifyOnPage(CheckAnswersPage)
  })

  it('Selecting Determinate sentence radio takes user to the determinate-sentence page', () => {
    cy.signIn()
    const imprisonmentStatusPage = ImprisonmentStatusPage.goTo(expectedArrival.id)
    imprisonmentStatusPage.determinateSentenceRadioButton().click()
    imprisonmentStatusPage.continue().click()
    Page.verifyOnPage(MovementReasonsPage)
  })
})
