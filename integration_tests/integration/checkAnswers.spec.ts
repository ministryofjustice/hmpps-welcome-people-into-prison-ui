import CheckAnswersPage from '../pages/checkAnswers'
import Page from '../pages/page'
import ConfirmAddedToRollPage from '../pages/confirmAddedToRoll'
import Role from '../../server/authentication/role'

context('Check Answers', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubAuthUser')
    cy.task('stubExpectedArrivals', 'MDI')
    cy.task('stubMissingPrisonerImage')
    cy.task('stubPrison', 'MDI')
  })

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

  it('Should contain a full set of correctly formatted move data', () => {
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const checkAnswersPage = CheckAnswersPage.goTo(expectedArrival.id)

    checkAnswersPage.name().should('contain.text', 'Harry Stanton')
    checkAnswersPage.dob().should('contain.text', '29 January 1961')
    checkAnswersPage.prisonNumber().should('contain.text', 'A1234AB')
    checkAnswersPage.pncNumber().should('contain.text', '01/3456A')
    checkAnswersPage.reason().should('contain.text', "Remanded to Magistrates' Court - Unconvicted Remand")
    cy.task('stubCreateOffenderRecordAndBooking', '00000-11111')
    checkAnswersPage.addToRoll().click()
    Page.verifyOnPage(ConfirmAddedToRollPage)
  })

  it('Should not display prison or pnc numbers if none present', () => {
    expectedArrival.prisonNumber = null
    expectedArrival.pncNumber = null

    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const checkAnswersPage = CheckAnswersPage.goTo(expectedArrival.id)
    checkAnswersPage.prisonNumber().should('not.exist')
    checkAnswersPage.pncNumber().should('not.exist')
    cy.task('stubCreateOffenderRecordAndBooking', '00000-11111')
    checkAnswersPage.addToRoll().click()
    Page.verifyOnPage(ConfirmAddedToRollPage)
  })
})
