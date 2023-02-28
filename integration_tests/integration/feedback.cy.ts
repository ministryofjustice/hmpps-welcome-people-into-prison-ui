import Page from '../pages/page'
import Role from '../../server/authentication/role'
import FeedbackFormPage from '../pages/feedback/feedbackForm'
import FeedbackConfirmationPage from '../pages/feedback/feedbackConfirmation'
import HomePage from '../pages/homePage'

context('A user can provide feedback', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', [Role.PRISON_RECEPTION])
    cy.task('stubPrison', 'MDI')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
  })

  it('Should display error message when needed', () => {
    cy.signIn()
    const feedbackFormPage = FeedbackFormPage.goTo()
    feedbackFormPage.email().type('useremail.com')
    feedbackFormPage.submit().click()

    feedbackFormPage.hasError('Enter your feedback')
    feedbackFormPage.hasError('Enter an email address in the correct format, like name@example.com')

    feedbackFormPage.feedback().type('Some content')
    feedbackFormPage.email().should('have.value', 'useremail.com')
    feedbackFormPage.email().clear().type('user@email.com')

    feedbackFormPage.submit().click()

    const feedbackConfirmation = Page.verifyOnPage(FeedbackConfirmationPage)

    feedbackConfirmation.backToWelcomePeopleIntoPrison().click()

    Page.verifyOnPage(HomePage)
  })
})
