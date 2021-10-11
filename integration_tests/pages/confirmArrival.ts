import Page from './page'

export default class ConfirmArrivalPage extends Page {
  constructor() {
    super('Confirm arrival')
  }

  static goTo(): ConfirmArrivalPage {
    cy.visit('/prisoners/12345/confirm-arrival')
    return Page.verifyOnPage(ConfirmArrivalPage)
  }
}
