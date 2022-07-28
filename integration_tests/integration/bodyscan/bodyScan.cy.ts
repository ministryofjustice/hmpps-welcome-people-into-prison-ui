import Role from '../../../server/authentication/role'
import BodyScanPage from '../../pages/bodyscan/bodyScan'
import expectedArrivals from '../../mockApis/responses/expectedArrivals'

const arrival = expectedArrivals.potentialMatch

context('A user can record a body scan', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubPrisonerDetails', arrival)
  })

  it('Should display error message when needed', () => {
    cy.signIn()
    const bodyScanPage = BodyScanPage.goTo(arrival.prisonNumber)

    bodyScanPage.bodyScanTitleName().should('contain.text', 'Sam Smith')
    bodyScanPage.submit().click()

    bodyScanPage.hasError('Select a date for the body scan')

    bodyScanPage.dateRadioButtons('another-date').click()
    bodyScanPage.day().type('13')
    bodyScanPage.month().type('07')
    bodyScanPage.year().type('2022')
    bodyScanPage.submit().click()

    bodyScanPage.dateRadioButtons('another-date').should('be.checked')
    bodyScanPage.day().should('have.value', '13')
    bodyScanPage.month().should('have.value', '07')
    bodyScanPage.year().should('have.value', '2022')

    bodyScanPage.hasError('Select a reason for the body scan')
  })
})
