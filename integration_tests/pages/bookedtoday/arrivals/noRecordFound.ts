import Page, { PageElement } from '../../page'

export default class NoRecordFoundPage extends Page {
  constructor() {
    super('This person has an existing prisoner record')
  }

  static goTo(id: string): NoRecordFoundPage {
    cy.visit(`/prisoners/${id}/no-record-found`)
    return Page.verifyOnPage(NoRecordFoundPage)
  }

  perName = (): PageElement => cy.get(`.data-qa-per-record-prisoner-name`)

  perDob = (): PageElement => cy.get(`.data-qa-per-record-dob`)

  perPrisonNumber = (): PageElement => cy.get(`.data-qa-per-record-prison-number`)

  perPncNumber = (): PageElement => cy.get(`.data-qa-per-record-pnc-number`)

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
