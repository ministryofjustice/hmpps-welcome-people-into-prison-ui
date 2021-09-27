import ChoosePrisonerPage from '../pages/choosePrisoner'
import Page from '../pages/page'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubIncomingMovements', 'MDI')
  })

  it('A user can view list of incoming movements from courts', () => {
    cy.signIn()
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)
    choosePrisonerPage.incomingMovementsFromCourt(1).should('contain.text', 'Doe, John')
    choosePrisonerPage.incomingMovementsFromCourt(2).should('contain.text', 'Smith, Sam')
  })

  it('A user can view list of incoming movements from custody suites', () => {
    cy.signIn()
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)
    choosePrisonerPage.incomingMovementsFromCustodySuite(1).should('contain.text', 'Prisoner, Mark')
    choosePrisonerPage.incomingMovementsFromCustodySuite(2).should('contain.text', 'Smith, Barry')
    choosePrisonerPage.incomingMovementsFromCustodySuite(3).should('contain.text', 'Smith, Bob')
  })

  it('A user can view list of incoming movements from another establishement', () => {
    cy.signIn()
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)
    choosePrisonerPage.incomingMovementsFromAnotherEstablishment(1).should('contain.text', 'Offender, Karl')
  })

  it("A user can view prisoner's actual image", () => {
    cy.task('stubPrisonerImage', { prisonerNumber: 'G0013AB', imageFile: '/test-image.jpeg' })

    cy.signIn()
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)
    choosePrisonerPage
      .prisonerImage(0)
      .should('be.visible')
      .should('have.attr', 'src')
      .then(src => {
        expect(src).equal('/prisoner/G0013AB/image')
      })

    choosePrisonerPage
      .prisonerImage(0)
      .should('have.attr', 'alt')
      .then(altText => {
        expect(altText).equal('Headshot of Doe, John')
      })
  })

  it('A user can view placeholder image', () => {
    cy.task('stubPrisonerImage', { prisonerNumber: 'G0014GM', imageFile: '/placeholder-image.png' })

    cy.signIn()
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)
    choosePrisonerPage
      .prisonerImage(1)
      .should('be.visible')
      .should('have.attr', 'src')
      .then(src => {
        expect(src).equal('/prisoner/G0014GM/image')
      })

    choosePrisonerPage
      .prisonerImage(1)
      .should('have.attr', 'alt')
      .then(altText => {
        expect(altText).equal('Headshot of Smith, Sam')
      })
  })
})
