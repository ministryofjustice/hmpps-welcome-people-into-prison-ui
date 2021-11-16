import Page from '../pages/page'
import CheckAnswersPage from '../pages/checkAnswers'
import ConfirmAddedToRollPage from '../pages/confirmAddedToRoll'
import ChoosePrisonerPage from '../pages/choosePrisoner'
import Role from '../../server/authentication/role'

context('Confirm Added To Roll', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubAuthUser')
    cy.task('stubExpectedArrivals', 'MDI')
    cy.task('stubMissingPrisonerImage')
    cy.task('stubPrison', 'MDI')
    cy.task('stubImprisonmentStatus')
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

  it('Should contain correctly formatted move data on confirmation page', () => {
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    cy.setCookie(
      'status-and-reason',
      's%3Aj%3A%7B%22code%22%3A%22determinate-sentence%22%2C%22imprisonmentStatus%22%3A%22SENT%22%2C%22movementReasonCode%22%3A%2226%22%7D.QEx%2B2EcyCfMkSknBJwkaVswIBLsUTbGFLkXur2qN%2Fro',
      { httpOnly: true, sameSite: 'lax' }
    )
    const checkAnswersPage = CheckAnswersPage.goTo(expectedArrival.id)
    cy.task('stubCreateOffenderRecordAndBooking', '00000-11111')
    checkAnswersPage.addToRoll().click()
    const confirmAddedToRollPage = Page.verifyOnPage(ConfirmAddedToRollPage)
    confirmAddedToRollPage.confirmationBanner().should('contain.html', 'Harry Stanton')
    confirmAddedToRollPage.confirmationBanner().should('contain.html', 'A1234AB')
    confirmAddedToRollPage.confirmationParagraph().should('contain.html', 'Harry Stanton')
    confirmAddedToRollPage.confirmationParagraph().should('contain.html', 'Moorland (HMP &amp; YOI)')
    confirmAddedToRollPage.addAnotherToRoll().click()
    Page.verifyOnPage(ChoosePrisonerPage)
  })
})
