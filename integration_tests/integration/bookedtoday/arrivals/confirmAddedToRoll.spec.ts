import Page from '../../../pages/page'
import ExistingRecordPage from '../../../pages/bookedtoday/arrivals/existingRecord'
import CheckAnswersPage from '../../../pages/bookedtoday/arrivals/checkAnswers'
import ConfirmAddedToRollPage from '../../../pages/bookedtoday/arrivals/confirmAddedToRoll'
import ChoosePrisonerPage from '../../../pages/bookedtoday/choosePrisoner'
import Role from '../../../../server/authentication/role'

import expectedArrivals from '../../../mockApis/responses/expectedArrivals'
import ImprisonmentStatusPage from '../../../pages/bookedtoday/arrivals/imprisonmentStatus'

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
    const existingRecordPage = ExistingRecordPage.goTo(expectedArrival.id)
    existingRecordPage.continue().click()

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
    confirmAddedToRollPage.locationParagraph().should('contain.html', 'Reception')
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
