import Page from '../../pages/page'
import Role from '../../../server/authentication/role'
import BodyScanPage from '../../pages/bodyscan/bodyScan'
import expectedArrivals from '../../mockApis/responses/expectedArrivals'
import BodyScanConfirmation from '../../pages/bodyscan/bodyScanConfirmation'
import bodyScans from '../../mockApis/responses/bodyScans'
import PrisonerSummaryPage from '../../pages/recentArrivals/prisonerSummary'

const arrival = expectedArrivals.potentialMatch

context('A user can record a body scan', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', [Role.PRISON_RECEPTION])
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubBodyScanPrisonerDetails', arrival)
  })

  it('Should display error message when needed', () => {
    cy.signIn()
    cy.task('stubGetBodyScan', {
      prisonNumber: arrival.prisonNumber,
      details: bodyScans.okToScan(),
    })
    const bodyScanPage = BodyScanPage.goTo(arrival.prisonNumber)

    bodyScanPage.bodyScanTitleName().should('contain.text', 'Sam Smith')
    bodyScanPage.submit().click()

    bodyScanPage.closeToLimitWarning().should('not.exist')
    bodyScanPage.reachedLimitWarning().should('not.exist')

    bodyScanPage.hasError('Select a date for the body scan')
    bodyScanPage.hasError('Select a reason for the body scan')
    bodyScanPage.hasError('Select a result for the body scan')

    bodyScanPage.userSelectedDate('another-date').click()
    bodyScanPage.day().type('13')
    bodyScanPage.month().type('07')
    bodyScanPage.year().type('2022')
    bodyScanPage.submit().click()

    bodyScanPage.userSelectedDate('another-date').should('be.checked')
    bodyScanPage.day().should('have.value', '13')
    bodyScanPage.month().should('have.value', '07')
    bodyScanPage.year().should('have.value', '2022')

    bodyScanPage.reason('INTELLIGENCE').click()
    bodyScanPage.result('POSITIVE').click()

    cy.task('stubSubmitBodyScan', { prisonNumber: arrival.prisonNumber })
    bodyScanPage.submit().click()

    cy.task('stubRetrieveBodyScanRequest', arrival.prisonNumber).then(request => {
      expect(request).to.deep.equal({
        date: '2022-07-13',
        reason: 'INTELLIGENCE',
        result: 'POSITIVE',
      })
    })
    const bodyScanConfirmation = Page.verifyOnPage(BodyScanConfirmation)
    bodyScanConfirmation.addCaseNote(expectedArrivals.potentialMatch.prisonNumber).exists()
    bodyScanConfirmation.confirmationBanner().contains('Sam Smith')
    bodyScanConfirmation.confirmationBanner().contains('Wednesday 13 July')
    bodyScanConfirmation.confirmationBanner().contains('Intelligence - positive')
  })

  it('Should show close to limit message', () => {
    cy.signIn()
    cy.task('stubGetBodyScan', {
      prisonNumber: arrival.prisonNumber,
      details: bodyScans.closeToLimit(),
    })
    const bodyScanPage = BodyScanPage.goTo(arrival.prisonNumber)

    bodyScanPage.closeToLimitWarning().should('exist')
    bodyScanPage.reachedLimitWarning().should('not.exist')
  })

  it('Should show limit reached message', () => {
    cy.signIn()
    cy.task('stubGetBodyScan', {
      prisonNumber: arrival.prisonNumber,
      details: bodyScans.doNotScan(),
    })
    const bodyScanPage = BodyScanPage.goTo(arrival.prisonNumber)

    bodyScanPage.closeToLimitWarning().should('not.exist')
    bodyScanPage.reachedLimitWarning().should('exist')
  })

  it('Should record and confirm a scan then return to prisoner summary page', () => {
    cy.signIn()
    cy.task('stubGetBodyScan', {
      prisonNumber: arrival.prisonNumber,
      details: bodyScans.okToScan(),
    })

    cy.task('stubPrisonerDetails', arrival)
    cy.task('stubSubmitBodyScan', { prisonNumber: arrival.prisonNumber })

    const bodyScanPage = BodyScanPage.goTo(arrival.prisonNumber)
    bodyScanPage.userSelectedDate('today').click()
    bodyScanPage.reason('INTELLIGENCE').click()
    bodyScanPage.result('POSITIVE').click()
    bodyScanPage.submit().click()

    const bodyScanConfirmation = Page.verifyOnPage(BodyScanConfirmation)
    bodyScanConfirmation.backToPrisonerSummaryButton().click()

    const prisonerSummaryPage = new PrisonerSummaryPage(`${arrival.lastName}, ${arrival.firstName}`)
    prisonerSummaryPage.checkOnPage()
  })
})
