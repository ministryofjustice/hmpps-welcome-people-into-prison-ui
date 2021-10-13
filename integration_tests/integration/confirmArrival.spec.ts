import ConfirmArrivalPage from '../pages/confirmArrival'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubExpectedArrivals', 'MDI')
    cy.task('stubMissingPrisonerImage')
  })

  const expectedArrival = {
    id: '00000-11111',
    firstName: 'Harry',
    lastName: 'Stanton',
    dateOfBirth: '1961-01-29',
    prisonNumber: 'A1234AB',
    pncNumber: '01/3456A',
    date: '2021-09-01',
    fromLocation: 'Reading',
    fromLocationType: 'COURT',
  }

  it('Should contain a full set of correctly formatted move data', () => {
    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const confirmArrivalPage = ConfirmArrivalPage.goTo(expectedArrival.id)

    confirmArrivalPage.name().should('contain.text', 'Harry Stanton')
    confirmArrivalPage.dob().should('contain.text', '29 January 1961')
    confirmArrivalPage.prisonNumber().should('contain.text', 'A1234AB')
    confirmArrivalPage.pncNumber().should('contain.text', '01/3456A')
    confirmArrivalPage.continue().should('have.attr', 'href', '/prisoners/00000-11111/check-answers')
    confirmArrivalPage.prisonerImage().should('have.attr', 'src', '/prisoner/A1234AB/image')
  })

  it('Should not display prison or pnc numbers', () => {
    expectedArrival.prisonNumber = null
    expectedArrival.pncNumber = null

    cy.task('stubExpectedArrival', expectedArrival)
    cy.signIn()
    const confirmArrivalPage = ConfirmArrivalPage.goTo(expectedArrival.id)
    confirmArrivalPage.prisonNumber().should('not.exist')
    confirmArrivalPage.pncNumber().should('not.exist')
    confirmArrivalPage.prisonerImage().should('have.attr', 'src', '/assets/images/placeholder-image.png')
  })
})
