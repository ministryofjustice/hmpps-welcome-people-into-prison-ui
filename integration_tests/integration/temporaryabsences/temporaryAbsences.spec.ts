import Page from '../../pages/page'
import Role from '../../../server/authentication/role'
import TemporaryAbsencesPage from '../../pages/temporaryAbsences'
import CheckTemporaryAbsencePage from '../../pages/checkTemporaryAbsence'
import temporaryAbsences from '../../mockApis/responses/temporaryAbsences'

context('A user can view all current temporary absences', () => {
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
    cy.task('stubMissingPrisonerImage')
  })

  it('A user can view list of temporary absences and link to expected arrivals list', () => {
    cy.signIn()
    const temporaryAbsencesPage = TemporaryAbsencesPage.goTo()
    temporaryAbsencesPage.temporaryAbsences(1).name().should('contain.text', 'Doe, John')
    temporaryAbsencesPage.temporaryAbsences(1).dob().should('contain.text', '1 January 1971')
    temporaryAbsencesPage.temporaryAbsences(1).prisonNumber().should('contain.text', 'G0013AB')
    temporaryAbsencesPage.temporaryAbsences(1).reasonForAbsence().should('contain.text', 'Hospital appointment')
    temporaryAbsencesPage.temporaryAbsences(1).movementDateTime().should('contain.text', '17 January 2022, 14:20')

    temporaryAbsencesPage.temporaryAbsences(2).name().should('contain.text', 'Offender, Karl')
    temporaryAbsencesPage.temporaryAbsences(2).dob().should('contain.text', '1 January 1985')
    temporaryAbsencesPage.temporaryAbsences(2).prisonNumber().should('contain.text', 'G0015GD')
    temporaryAbsencesPage.temporaryAbsences(2).reasonForAbsence().should('contain.text', 'Hospital appointment')
    temporaryAbsencesPage.temporaryAbsences(2).movementDateTime().should('contain.text', '5 January 2022, 10:20')

    temporaryAbsencesPage
      .linkToExpectedArrivals()
      .should('contain', 'booked to arrive into prison')
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.equal('/confirm-arrival/choose-prisoner')
      })
  })

  it("A user can view prisoner's actual image", () => {
    cy.task('stubPrisonerImage', { prisonerNumber: 'G0013AB', imageFile: '/test-image.jpeg' })

    cy.signIn()
    const temporaryAbsencesPage = TemporaryAbsencesPage.goTo()
    temporaryAbsencesPage
      .prisonerImage(0)
      .should('be.visible')
      .should('have.attr', 'src')
      .then(src => {
        expect(src).equal('/prisoner/G0013AB/image')
      })

    temporaryAbsencesPage
      .prisonerImage(0)
      .should('have.attr', 'alt')
      .then(altText => {
        expect(altText).equal('Headshot of Doe, John')
      })
  })

  it('No links shown if not a reception user', () => {
    cy.task('stubSignIn')
    cy.signIn()
    const temporaryAbsencesPage = TemporaryAbsencesPage.goTo()

    temporaryAbsencesPage.temporaryAbsences(1).confirm().should('not.exist')
    temporaryAbsencesPage.temporaryAbsences(2).confirm().should('not.exist')
    temporaryAbsencesPage.temporaryAbsences(3).confirm().should('not.exist')
    temporaryAbsencesPage.temporaryAbsences(4).confirm().should('not.exist')
  })

  it.only('Links shown for a reception user navigate to confirm a returning prisoner page', () => {
    cy.signIn()
    const temporaryAbsencesPage = TemporaryAbsencesPage.goTo()

    temporaryAbsencesPage.temporaryAbsences(1).confirm().should('exist')
    temporaryAbsencesPage.temporaryAbsences(2).confirm().should('exist')
    temporaryAbsencesPage.temporaryAbsences(3).confirm().should('exist')
    temporaryAbsencesPage.temporaryAbsences(4).confirm().should('exist')

    temporaryAbsencesPage.temporaryAbsences(1).confirm().click()
    Page.verifyOnPage(CheckTemporaryAbsencePage)
  })
})
