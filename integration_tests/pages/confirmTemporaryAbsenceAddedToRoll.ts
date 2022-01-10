import Page from './page'

export default class ConfirmTemporaryAbsenceAddedToRollPage extends Page {
  constructor() {
    super('is on the establishment roll and is located in reception')
  }

  static goTo(id: string): ConfirmTemporaryAbsenceAddedToRollPage {
    cy.visit(`/prisoners/${id}/prisoner-returned`)
    return Page.verifyOnPage(ConfirmTemporaryAbsenceAddedToRollPage)
  }
}
