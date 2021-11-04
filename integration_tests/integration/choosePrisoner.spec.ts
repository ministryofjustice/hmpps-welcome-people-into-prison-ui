import ChoosePrisonerPage from '../pages/choosePrisoner'
import ConfirmArrivalPage from '../pages/confirmArrival'
import Page from '../pages/page'
import Role from '../../server/authentication/role'

const expectedArrivalUnmatchedInNomis = {
  id: '00000-11111',
  firstName: 'Harry',
  lastName: 'Stanton',
  dateOfBirth: '1961-01-29',
  prisonNumber: null,
  pncNumber: '01/3456A',
  date: '2021-09-01',
  fromLocation: 'Reading',
  fromLocationType: 'COURT',
  isCurrentPrisoner: false,
}

const expectedArrivalMatchedInNomisWithNoBooking = {
  id: '00000-222222',
  firstName: 'Sam',
  lastName: 'Smith',
  dateOfBirth: '1970-02-01',
  prisonNumber: 'G0014GM',
  pncNumber: '01/4567A',
  date: '2021-09-01',
  fromLocation: 'Leeds',
  fromLocationType: 'COURT',
  isCurrentPrisoner: false,
}

context('Choose Prisoner', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubAuthUser')
    cy.task('stubExpectedArrivals', 'MDI')
    cy.task('stubMissingPrisonerImage')
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

  it('Should handle no expected arrivals', () => {
    cy.task('stubNoExpectedArrivals', 'MDI')
    cy.signIn()
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)
    choosePrisonerPage
      .noExpectedArrivalsFromCourt()
      .should('contain.text', 'There are currently no prisoners booked to arrive from court today.')
    choosePrisonerPage
      .noExpectedArrivalsFromCustodySuite()
      .should('contain.text', 'There are currently no prisoners booked to arrive from a custody suite today.')
    choosePrisonerPage
      .noExpectedArrivalsFromAnotherEstablishment()
      .should('contain.text', 'There are currently no prisoners booked to arrive from another establishment today.')
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
        expect(altText).equal('Doe, John')
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
        expect(altText).equal('Smith, Sam')
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
        expect(altText).equal('Stanton, Harry')
      })
  })

  it('Only court arrivals with no current booking will have a link leading to the Confirm arrival page', () => {
    cy.signIn()
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)

    choosePrisonerPage.arrivalFrom('PRISON')(1).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(1).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(2).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().should('not.exist')

    cy.task('stubExpectedArrival', expectedArrivalMatchedInNomisWithNoBooking)
    choosePrisonerPage.arrivalFrom('COURT')(2).confirm().should('exist').click()
    Page.verifyOnPage(ConfirmArrivalPage)
      .prisonNumber()
      .should('contain.text', expectedArrivalMatchedInNomisWithNoBooking.prisonNumber)

    cy.go('back')

    cy.task('stubExpectedArrival', expectedArrivalUnmatchedInNomis)
    choosePrisonerPage.arrivalFrom('COURT')(3).confirm().should('exist').click()
    Page.verifyOnPage(ConfirmArrivalPage).prisonNumber().should('not.exist')
  })

  it('No links shown if not a reception user', () => {
    cy.task('stubSignIn')
    cy.signIn()
    const choosePrisonerPage = Page.verifyOnPage(ChoosePrisonerPage)

    choosePrisonerPage.arrivalFrom('PRISON')(1).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(1).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(2).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(3).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('COURT')(2).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('COURT')(3).confirm().should('not.exist')
  })
})
