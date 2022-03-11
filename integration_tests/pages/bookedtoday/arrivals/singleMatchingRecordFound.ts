import Page, { PageElement } from '../../page'

export default class SingleMatchingRecordFoundPage extends Page {
  constructor() {
    super('This person has an existing prisoner record')
  }

  perName = (): PageElement => cy.get(`.data-qa-per-record-prisoner-name`)

  perDob = (): PageElement => cy.get(`.data-qa-per-record-dob`)

  perPrisonNumber = (): PageElement => cy.get(`.data-qa-per-record-prison-number`)

  perPncNumber = (): PageElement => cy.get(`.data-qa-per-record-pnc-number`)

  existingName = (): PageElement => cy.get(`.data-qa-existing-record-prisoner-name`)

  existingDob = (): PageElement => cy.get(`.data-qa-existing-record-dob`)

  existingPrisonNumber = (): PageElement => cy.get(`.data-qa-existing-record-prison-number`)

  existingPncNumber = (): PageElement => cy.get(`.data-qa-existing-record-pnc-number`)

  prisonerImage = (): PageElement => cy.get(`[data-qa=prisoner-image]`)

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
