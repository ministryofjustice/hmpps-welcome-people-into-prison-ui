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

  checkDetails = ({
    name,
    sex,
    dob,
    reason,
    pncNumber,
    submissionParagraphTitle,
  }: {
    name: string
    dob: string
    sex: string
    reason: string
    pncNumber?: string
    submissionParagraphTitle?: string
  }) => {
    this.backNavigation().should('exist')
    this.name().should('contain.text', name)
    this.dob().should('contain.text', dob)
    this.sex().should('contain.text', sex)
    this.reason().should('contain.text', reason)
    if (pncNumber) {
      this.pncNumber().should('contain.text', pncNumber)
    }
    if (submissionParagraphTitle) {
      this.submissionParagraphTitle().should('contain.text', submissionParagraphTitle)
    }
  }

  addToRoll = (): PageElement => cy.get('[data-qa=add-to-roll]')
}
