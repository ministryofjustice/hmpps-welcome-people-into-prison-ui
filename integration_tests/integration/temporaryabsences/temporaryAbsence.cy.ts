import Page from '../../pages/page'
import Role from '../../../server/authentication/role'
import temporaryAbsences from '../../mockApis/responses/temporaryAbsences'
import TemporaryAbsencePage from '../../pages/temporaryabsences/temporaryAbsences'
import ConfirmTemporaryAbsenceAddedToRollPage from '../../pages/temporaryabsences/confirmTemporaryAbsenceAddedToRoll'
import CheckTemporaryAbsencePage from '../../pages/temporaryabsences/checkTemporaryAbsence'

context('Confirm temporary absence added', () => {
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
    cy.task('stubRetrieveMultipleBodyScans', [])
    cy.signIn()
  })

  it('Should display View establishment roll button and Back to Digital Prisons Services link with correct hrefs', () => {
    const temporaryAbsencePage = TemporaryAbsencePage.goTo()
    temporaryAbsencePage.temporaryAbsences(1).confirm().click()

    const checkTemporaryAbsencePage = Page.verifyOnPage(CheckTemporaryAbsencePage)
    checkTemporaryAbsencePage.addToRoll().click()

    const confirmTemporaryAbsenceAddedToRollPage = Page.verifyOnPage(ConfirmTemporaryAbsenceAddedToRollPage)

    confirmTemporaryAbsenceAddedToRollPage.addCaseNote(temporaryAbsences[0].prisonNumber).exists()
    confirmTemporaryAbsenceAddedToRollPage.backToNewArrivals().exists()
    confirmTemporaryAbsenceAddedToRollPage.viewEstablishmentRoll().exists()
  })

  it('Should return to prisoners-returning page when clicking Return to list link', () => {
    const checkTemporaryAbsencePage = CheckTemporaryAbsencePage.goTo(temporaryAbsences[0].prisonNumber)
    checkTemporaryAbsencePage.returnToTemporaryAbsencesList().click()
    Page.verifyOnPage(TemporaryAbsencePage)
  })
})
