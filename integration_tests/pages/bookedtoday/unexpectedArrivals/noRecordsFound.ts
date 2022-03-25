import Page, { PageElement } from '../../page'

export default class NoRecordsFoundPage extends Page {
  constructor() {
    super('This person does not have an existing prisoner record')
  }

  name = (): PageElement => cy.get('.data-qa-arrival-prisoner-name')

  dob = (): PageElement => cy.get('.data-qa-arrival-dob')
}
