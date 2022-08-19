import Page, { PageElement } from '../page'

export default class FeedbackFormPage extends Page {
  constructor() {
    super('Give feedback on Welcome people into prison', { hasBackLink: true }, { hasFeedbackBanner: false })
  }

  static goTo(): FeedbackFormPage {
    cy.visit(`/feedback`)
    return Page.verifyOnPage(FeedbackFormPage)
  }

  feedback = (): PageElement => cy.get('[data-qa="feedback"]')

  email = (): PageElement => cy.get('[data-qa="email"]')

  submit = (): PageElement => cy.get(`[data-qa=submit]`)
}
