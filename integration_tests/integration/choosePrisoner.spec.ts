import ChoosePrisonerPage from '../pages/choosePrisoner'
import ConfirmArrivalPage from '../pages/confirmArrival'
import Page from '../pages/page'
import Role from '../../server/authentication/role'
import expectedArrivals from '../mockApis/responses/expectedArrivals'

context('Choose Prisoner', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubAuthUser')
    cy.task('stubExpectedArrivals', {
      caseLoadId: 'MDI',
      arrivals: [
        expectedArrivals.prisonTransfer,
        expectedArrivals.custodySuite.current,
        expectedArrivals.custodySuite.notCurrent,
        expectedArrivals.custodySuite.notMatched,
        expectedArrivals.other,
        expectedArrivals.court.current,
        expectedArrivals.court.notCurrent,
        expectedArrivals.court.notMatched,
      ],
    })
    cy.task('stubMissingPrisonerImage')
  })

  it('A user can view list of expected arrivals', () => {
    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.expectedArrivalsFromCourt(1).should('contain.text', 'Doe, John')
    choosePrisonerPage.expectedArrivalsFromCourt(2).should('contain.text', 'Smith, Sam')

    choosePrisonerPage.expectedArrivalsFromCustodySuite(1).should('contain.text', 'Prisoner, Mark')
    choosePrisonerPage.expectedArrivalsFromCustodySuite(2).should('contain.text', 'Smith, Barry')
    choosePrisonerPage.expectedArrivalsFromCustodySuite(3).should('contain.text', 'Smith, Bob')

    choosePrisonerPage.expectedArrivalsFromAnotherEstablishment(1).should('contain.text', 'Offender, Karl')
  })

  it('Should handle no expected arrivals', () => {
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [] })
    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()
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
    const choosePrisonerPage = ChoosePrisonerPage.goTo()
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
    const choosePrisonerPage = ChoosePrisonerPage.goTo()
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
    const choosePrisonerPage = ChoosePrisonerPage.goTo()
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

  it('Only court arrivals with no current booking and arrivals from custody suites will have a link leading to the Confirm arrival page', () => {
    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()

    choosePrisonerPage.arrivalFrom('PRISON')(1).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(1).confirm().should('not.exist')

    canStartToConfirmArrival(choosePrisonerPage, expectedArrivals.court.notCurrent, 'COURT', 2)
    canStartToConfirmArrival(choosePrisonerPage, expectedArrivals.court.notMatched, 'COURT', 3)

    canStartToConfirmArrival(choosePrisonerPage, expectedArrivals.custodySuite.notCurrent, 'CUSTODY_SUITE', 2)
    canStartToConfirmArrival(choosePrisonerPage, expectedArrivals.custodySuite.notMatched, 'CUSTODY_SUITE', 3)
  })

  it('No links shown if not a reception user', () => {
    cy.task('stubSignIn')
    cy.signIn()
    const choosePrisonerPage = ChoosePrisonerPage.goTo()

    choosePrisonerPage.arrivalFrom('PRISON')(1).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(1).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(2).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('CUSTODY_SUITE')(3).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('COURT')(2).confirm().should('not.exist')
    choosePrisonerPage.arrivalFrom('COURT')(3).confirm().should('not.exist')
  })

  function canStartToConfirmArrival(
    choosePrisonerPage: ChoosePrisonerPage,
    stub: Record<string, string | boolean>,
    arrivalType: 'COURT' | 'PRISON' | 'CUSTODY_SUITE',
    rowNumber: number
  ) {
    cy.task('stubExpectedArrival', stub)
    choosePrisonerPage.arrivalFrom(arrivalType)(rowNumber).confirm().should('exist').click()
    Page.verifyOnPage(ConfirmArrivalPage).name().should('contain.text', `${stub.firstName} ${stub.lastName}`)
    cy.go('back')
  }
})
