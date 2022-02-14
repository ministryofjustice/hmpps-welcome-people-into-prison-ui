import Page, { PageElement } from '../../../page'

export default class ChangePncNumberPage extends Page {
  constructor() {
    super("Add or change this person's PNC number")
  }

  pnc = (): PageElement => cy.get('#pnc-number')

  save = (): PageElement => cy.get(`[data-qa=save]`)
}
