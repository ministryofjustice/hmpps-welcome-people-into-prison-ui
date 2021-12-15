import Page from '../pages/page'
import ImprisonmentStatusPage from '../pages/imprisonmentStatus'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'
import SexPage from '../pages/sexPage'

const expectedArrival = expectedArrivals.court.notCurrent
const expectedArrivalWithMaleGender = expectedArrivals.withFemaleGender

context('Sex', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubExpectedArrival', expectedArrival)
    cy.task('stubImprisonmentStatus')
  })

  it("Should display prisoner's name", () => {
    cy.signIn()
    const sexPage = SexPage.goTo(expectedArrival.id)
    sexPage.prisonerName().should('contain.text', 'Sam Smith')
  })

  it('Selecting Male or Female takes user to /imprisonment-status page', () => {
    cy.signIn()
    const sexPage = SexPage.goTo(expectedArrival.id)
    sexPage.sexRadioButtons('M')
    sexPage.continue().click()
    Page.verifyOnPage(ImprisonmentStatusPage)
  })

  it('If Arrival provided by API has gender of MALE or FEMALE, automatically redirects to /imprisonment-status page', () => {
    cy.signIn()
    cy.task('stubExpectedArrival', expectedArrivalWithMaleGender)
    SexPage.goToWithRedirect(expectedArrivalWithMaleGender.id)
  })

  it('Should display validation error if no imprisonment status selected', () => {
    cy.signIn()
    const sexPage = SexPage.goTo(expectedArrival.id)
    sexPage.continue().click()
    sexPage.errorSummaryTitle().contains('There is a problem')
    sexPage.errorSummaryBody().contains('Select a sex')
    sexPage.errorSummaryMessage().contains('Select a sex')
  })
})
