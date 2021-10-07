import Page from './page'

export default class ConfirmArrivalPage extends Page {
  constructor() {
    super('Confirm arrival')
  }

  static goTo(): ConfirmArrivalPage {
    cy.visit('/prisoner/12345/confirm-arrival')
    return Page.verifyOnPage(ConfirmArrivalPage)
  }
}
