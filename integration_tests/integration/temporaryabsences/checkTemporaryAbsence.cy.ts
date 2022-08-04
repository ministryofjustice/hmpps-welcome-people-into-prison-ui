import Page from '../../pages/page'
import Role from '../../../server/authentication/role'
import temporaryAbsences from '../../mockApis/responses/temporaryAbsences'
import TemporaryAbsencesPage from '../../pages/temporaryabsences/temporaryAbsences'
import CheckTemporaryAbsencePage from '../../pages/temporaryabsences/checkTemporaryAbsence'
import ConfirmTemporaryAbsenceAddedToRollPage from '../../pages/temporaryabsences/confirmTemporaryAbsenceAddedToRoll'

context('Check Temporary Absence', () => {
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
    cy.task('stubGetBodyScanInfo', [])
    cy.signIn()
  })

  it('Should go to prisoner-returned page when clicking add to roll button', () => {
    const checkTemporaryAbsencePage = CheckTemporaryAbsencePage.goTo(temporaryAbsences[0].prisonNumber)
    checkTemporaryAbsencePage.addToRoll().click()
    Page.verifyOnPage(ConfirmTemporaryAbsenceAddedToRollPage)
  })

  it('Should return to prisoners-returning page when clicking Return to list link', () => {
    const checkTemporaryAbsencePage = CheckTemporaryAbsencePage.goTo(temporaryAbsences[0].prisonNumber)
    checkTemporaryAbsencePage.returnToTemporaryAbsencesList().click()
    Page.verifyOnPage(TemporaryAbsencesPage)
  })
})
