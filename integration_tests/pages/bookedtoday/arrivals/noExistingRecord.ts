import Page, { PageElement } from '../../page'

export default class NoExistingRecord extends Page {
  constructor() {
    super('This person does not have an existing prisoner record')
  }

  perName = (): PageElement => cy.get(`.data-qa-per-record-prisoner-name`)

  perDob = (): PageElement => cy.get(`.data-qa-per-record-dob`)

  perPrisonNumber = (): PageElement => cy.get(`.data-qa-per-record-prison-number`)

  perPncNumber = (): PageElement => cy.get(`.data-qa-per-record-pnc-number`)

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
