import Page, { PageElement } from '../../../page'

export default class CheckAnswersForCreateNewRecordPage extends Page {
  constructor() {
    super("You're about to add this person to the establishment roll")
  }

  name = (): PageElement => cy.get('.data-qa-prisoner-name')

  dob = (): PageElement => cy.get('.data-qa-dob')

  pncNumber = (): PageElement => cy.get('.data-qa-pnc-number')

  sex = (): PageElement => cy.get('.data-qa-sex')

  reason = (): PageElement => cy.get('.data-qa-reason')

  submissionParagraphTitle = () => cy.get('h2')

  addToRoll = (): PageElement => cy.get('[data-qa=add-to-roll]')
}
