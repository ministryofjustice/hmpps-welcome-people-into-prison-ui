import ChoosePrisonerPage from '../pages/choosePrisoner'
import ConfirmArrivalPage from '../pages/confirmArrival'
import Page from '../pages/page'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubExpectedArrivals', 'MDI')
  })

  it('A user can view list of expected arrivals from courts', () => {
    cy.signIn()
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)
    choosePrisonerPage.expectedArrivalsFromCourt(1).should('contain.text', 'Doe, John')
    choosePrisonerPage.expectedArrivalsFromCourt(2).should('contain.text', 'Smith, Sam')
  })

  it('A user can view list of expected arrivals from custody suites', () => {
    cy.signIn()
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)
    choosePrisonerPage.expectedArrivalsFromCustodySuite(1).should('contain.text', 'Prisoner, Mark')
    choosePrisonerPage.expectedArrivalsFromCustodySuite(2).should('contain.text', 'Smith, Barry')
    choosePrisonerPage.expectedArrivalsFromCustodySuite(3).should('contain.text', 'Smith, Bob')
  })

  it('A user can view list of expected arrivals from another establishement', () => {
    cy.signIn()
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)
    choosePrisonerPage.expectedArrivalsFromAnotherEstablishment(1).should('contain.text', 'Offender, Karl')
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

  it('A user will see placeholder image as prisoner has no image', () => {
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
  it('A user will see placeholder image as there is no prisoner number', () => {
    cy.signIn()
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)
    choosePrisonerPage
      .prisonerImage(2)
      .should('be.visible')
      .should('have.attr', 'src')
      .then(src => {
        expect(src).equal('/assets/images/placeholder-image.png')
      })

    choosePrisonerPage
      .prisonerImage(2)
      .should('have.attr', 'alt')
      .then(altText => {
        expect(altText).equal('Headshot of Stanton, Harry')
      })
  })

  it('Only the names and images of prisoners arriving from court and without a prisoner number will be clickable', () => {
    cy.signIn()
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)

    choosePrisonerPage.prisonerImageLink().should('have.length', 1)
    choosePrisonerPage.prisonerImageLink().eq(0).click()
    Page.verifyOnPage(ConfirmArrivalPage)

    cy.go('back')

    choosePrisonerPage.prisonerNameLink().should('have.length', 1)
    choosePrisonerPage.prisonerNameLink().eq(0).click()
    Page.verifyOnPage(ConfirmArrivalPage)
  })
})
