import Page, { PageElement } from '../../../../page'

export default class ChangePrisonNumberPage extends Page {
  constructor() {
    super("Add or change this person's prison number")
  }

  prisonNumber = (): PageElement => cy.get('#prison-number')

  save = (): PageElement => cy.get(`[data-qa=save]`)
}
