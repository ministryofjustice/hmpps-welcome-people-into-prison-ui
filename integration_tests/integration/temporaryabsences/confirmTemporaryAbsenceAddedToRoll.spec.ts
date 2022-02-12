import Page from '../../pages/page'
import Role from '../../../server/authentication/role'
import temporaryAbsences from '../../mockApis/responses/temporaryAbsences'
import TemporaryAbsencePage from '../../pages/temporaryAbsences'
import ConfirmTemporaryAbsenceAddedToRollPage from '../../pages/confirmTemporaryAbsenceAddedToRoll'
import CheckTemporaryAbsencePage from '../../pages/checkTemporaryAbsence'

context('Confirm temporary absence added To roll', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubTemporaryAbsences', 'MDI')
    cy.task('stubTemporaryAbsence', {
      activeCaseLoadId: 'MDI',
      prisonNumber: temporaryAbsences[0].prisonNumber,
      temporaryAbsence: temporaryAbsences[0],
    })
    cy.task('stubConfirmTemporaryAbsence', temporaryAbsences[0].prisonNumber)
    cy.signIn()
  })

  it('Should display View establishment roll button and Back to Digital Prisons Services link with correct hrefs', () => {
    const temporaryAbsencePage = TemporaryAbsencePage.goTo()
    temporaryAbsencePage.temporaryAbsences(1).confirm().click()

    const checkTemporaryAbsencePage = Page.verifyOnPage(CheckTemporaryAbsencePage)
    checkTemporaryAbsencePage.addToRoll().click()

    const confirmTemporaryAbsenceAddedToRollPage = Page.verifyOnPage(ConfirmTemporaryAbsenceAddedToRollPage)
    confirmTemporaryAbsenceAddedToRollPage
      .viewEstablishmentRoll()
      .should('contain', 'View establishment roll')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://digital-dev.prison.service.justice.gov.uk/establishment-roll')
      })
    confirmTemporaryAbsenceAddedToRollPage
      .backToDigitalPrisonServices()
      .should('contain', 'Back to Digital Prison Services')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://digital-dev.prison.service.justice.gov.uk')
      })
  })
})
