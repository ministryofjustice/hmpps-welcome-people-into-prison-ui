import Page from './page'

export default class ConfirmArrivalPage extends Page {
  constructor() {
    super('Check this record matches the person in reception')
  }

  static goTo(): ConfirmArrivalPage {
    cy.visit('/prisoners/12345/confirm-arrival')
    return Page.verifyOnPage(ConfirmArrivalPage)
  }
}
