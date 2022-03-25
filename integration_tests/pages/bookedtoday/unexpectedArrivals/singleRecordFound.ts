import Page, { PageElement } from '../../page'

export default class SingleRecordFoundPage extends Page {
  constructor() {
    super('An existing prisoner record has been found')
  }

  name = (): PageElement => cy.get('.data-qa-arrival-prisoner-name')

  dob = (): PageElement => cy.get('.data-qa-arrival-dob')

  prisonNumber = (): PageElement => cy.get('.data-qa-arrival-prison-number')

  existingRecordPrisonerName = (): PageElement => cy.get('.data-qa-existing-record-prisoner-name')

  existingRecordDob = (): PageElement => cy.get('.data-qa-existing-record-dob')

  existingRecordPrisonNumber = (): PageElement => cy.get('.data-qa-existing-record-prison-number')

  existingRecordPncNumber = (): PageElement => cy.get('.data-qa-existing-record-pnc-number')

  continue = (): PageElement => cy.get('[data-qa=continue]')
}
