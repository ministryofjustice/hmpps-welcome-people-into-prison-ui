import ChoosePrisonerPage from '../../../pages/bookedtoday/choosePrisoner'
import Page from '../../../pages/page'
import Role from '../../../../server/authentication/role'
import expectedArrivals from '../../../mockApis/responses/expectedArrivals'
import NoExistingRecordPage from '../../../pages/bookedtoday/arrivals/noExistingRecord'
import ReviewPerDetailsPage from '../../../pages/bookedtoday/arrivals/reviewPerDetails'
import ChangeNamePage from '../../../pages/bookedtoday/arrivals/changeName'
import ChangeDateOfBirthPage from '../../../pages/bookedtoday/arrivals/changeDateOfBirth'

context('Review per details spec', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', Role.PRISON_RECEPTION)
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubTransfers', { caseLoadId: 'MDI', transfers: [] })
    cy.task('stubMissingPrisonerImage')
    const arrival = expectedArrivals.arrival({
      fromLocationType: 'COURT',
      isCurrentPrisoner: false,
      potentialMatches: [],
    })
    cy.task('stubExpectedArrivals', { caseLoadId: 'MDI', arrivals: [arrival] })
    cy.task('stubExpectedArrival', arrival)

    cy.signIn()

    const choosePrisonerPage = ChoosePrisonerPage.goTo()
    choosePrisonerPage.arrivalFrom('COURT')(1).confirm().click()

    const noExistingRecordPage = Page.verifyOnPage(NoExistingRecordPage)
    noExistingRecordPage.perName().should('contain.text', 'Bob Smith')
    noExistingRecordPage.perDob().should('contain.text', '1 January 1970')
    noExistingRecordPage.perPncNumber().should('contain.text', '01/2345A')
    noExistingRecordPage.continue().click()
  })

  it('Change name', () => {
    {
      const reviewPerDetailsPage = Page.verifyOnPage(ReviewPerDetailsPage)
      const { value, change } = reviewPerDetailsPage.name
      value().contains('Bob Smith')
      change().click()
    }

    const changeNamePage = Page.verifyOnPage(ChangeNamePage)
    changeNamePage.firstName().should('have.value', 'Bob')
    changeNamePage.lastName().should('have.value', 'Smith')

    changeNamePage.firstName().clear().type('James')
    changeNamePage.lastName().clear()
    changeNamePage.save().click()

    changeNamePage.hasError("Enter this person's last name")

    changeNamePage.lastName().type('Joyce')
    changeNamePage.save().click()

    {
      const reviewPerDetailsPage = Page.verifyOnPage(ReviewPerDetailsPage)
      reviewPerDetailsPage.name.value().contains('James Joyce')
    }
  })

  it('Change date of birth', () => {
    {
      const reviewPerDetailsPage = Page.verifyOnPage(ReviewPerDetailsPage)
      const { value, change } = reviewPerDetailsPage.dob
      value().contains('1 January 1970')
      change().click()
    }

    const changeDobPage = Page.verifyOnPage(ChangeDateOfBirthPage)
    changeDobPage.day().should('have.value', '01')
    changeDobPage.month().should('have.value', '01')
    changeDobPage.year().should('have.value', '1970')

    changeDobPage.day().clear().type('20')
    changeDobPage.month().clear().type('9')
    changeDobPage.year().clear()

    changeDobPage.save().click()

    changeDobPage.hasError('Date of birth must include a year')
    changeDobPage.year().type('1982')

    changeDobPage.save().click()

    {
      const reviewPerDetailsPage = Page.verifyOnPage(ReviewPerDetailsPage)
      const { value } = reviewPerDetailsPage.dob
      value().contains('20 September 1982')
    }
  })
})
