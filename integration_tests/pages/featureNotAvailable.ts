import Page from './page'

export default class FeatureNotAvailablePage extends Page {
  constructor() {
    super('You cannot confirm the arrival of this person in this tool')
  }

  static goTo(id: string): FeatureNotAvailablePage {
    cy.visit(`/prisoners/${id}/feature-not-available`)
    return Page.verifyOnPage(FeatureNotAvailablePage)
  }
}
