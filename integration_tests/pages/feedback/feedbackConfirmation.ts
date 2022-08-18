import Page, { PageElement } from '../page'

export default class FeedbackConfirmation extends Page {
  constructor() {
    super('Thank you for your feedback', { hasBackLink: false }, { hasFeedbackBanner: false })
  }

  backToWelcomePeopleIntoPrison = (): PageElement => cy.get(`[data-qa=wpip]`)
}
