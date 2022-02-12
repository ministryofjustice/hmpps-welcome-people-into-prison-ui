import Page from '../../../pages/page'
import ConfirmArrivalPage from '../../../pages/confirmArrival'
import CheckAnswersPage from '../../../pages/checkAnswers'
import ConfirmAddedToRollPage from '../../../pages/confirmAddedToRoll'
import ChoosePrisonerPage from '../../../pages/choosePrisoner'
import Role from '../../../../server/authentication/role'

import expectedArrivals from '../../../mockApis/responses/expectedArrivals'
import ImprisonmentStatusPage from '../../../pages/imprisonmentStatus'

const expectedArrival = expectedArrivals.withFemaleGender

context('Confirm Added To Roll', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [] })
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [] })
    cy.task('stubMissingPrisonerImage')
    cy.task('stubPrison', 'MDI')
    cy.task('stubImprisonmentStatus')
    cy.task('stubExpectedArrival', expectedArrival)
  })

  it('Should contain correctly formatted move data and Back to Digital Prisons Services link on confirmation page', () => {
    cy.signIn()
    const confirmArrivalPage = ConfirmArrivalPage.goTo(expectedArrival.id)
    confirmArrivalPage.continue().click()

    const imprisonmentStatusPage = Page.verifyOnPage(ImprisonmentStatusPage)
    imprisonmentStatusPage.imprisonmentStatusRadioButton('on-remand').click()
    imprisonmentStatusPage.continue().click()

    const checkAnswersPage = CheckAnswersPage.goTo(expectedArrival.id)
    cy.task('stubCreateOffenderRecordAndBooking', expectedArrival.id)
    checkAnswersPage.addToRoll().click()
    const confirmAddedToRollPage = Page.verifyOnPage(ConfirmAddedToRollPage)
    confirmAddedToRollPage.confirmationBanner().should('contain.html', 'Steve Smith')
    confirmAddedToRollPage.confirmationBanner().should('contain.html', 'A1234AB')
    confirmAddedToRollPage.confirmationParagraph().should('contain.html', 'Steve Smith')
    confirmAddedToRollPage.confirmationParagraph().should('contain.html', 'Moorland (HMP &amp; YOI)')
    confirmAddedToRollPage
      .viewEstablishmentRoll()
      .should('contain', 'View establishment roll')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://digital-dev.prison.service.justice.gov.uk/establishment-roll')
      })
    confirmAddedToRollPage
      .backToDigitalPrisonServices()
      .should('contain', 'Back to Digital Prison Services')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('https://digital-dev.prison.service.justice.gov.uk')
      })
    confirmAddedToRollPage.addAnotherToRoll().click()
    Page.verifyOnPage(ChoosePrisonerPage)
  })
})
