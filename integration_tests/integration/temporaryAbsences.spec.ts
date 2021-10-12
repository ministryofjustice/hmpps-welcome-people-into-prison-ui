import TemporaryAbsencesPage from '../pages/temporaryAbsences'

context('A user can view all current temporary absences', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubExpectedArrivals', 'MDI')
    cy.task('stubTemporaryAbsences', 'MDI')
    cy.task('stubMissingPrisonerImage')
  })

  it('A user can view list of temporary absences', () => {
    cy.signIn()
    const temporaryAbsencesPage = TemporaryAbsencesPage.goTo()
    temporaryAbsencesPage.temporaryAbsences(1).should('contain.text', 'Doe, John')
    temporaryAbsencesPage.temporaryAbsences(2).should('contain.text', 'Offender, Karl')
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

  it('A user will see placeholder image as prisoner has no image', () => {
    cy.task('stubPrisonerImage', { prisonerNumber: 'G0015GD', imageFile: '/placeholder-image.png' })

    cy.signIn()
    const temporaryAbsencesPage = TemporaryAbsencesPage.goTo()
    temporaryAbsencesPage
      .prisonerImage(1)
      .should('be.visible')
      .should('have.attr', 'src')
      .then(src => {
        expect(src).equal('/prisoner/G0015GD/image')
      })

    temporaryAbsencesPage
      .prisonerImage(1)
      .should('have.attr', 'alt')
      .then(altText => {
        expect(altText).equal('Headshot of Offender, Karl')
      })
  })
})
