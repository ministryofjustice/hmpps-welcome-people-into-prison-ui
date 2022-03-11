import Page, { PageElement } from '../../../page'

export default class SexPage extends Page {
  constructor() {
    super('What is their sex?')
  }

  prisonerName = (): PageElement => cy.get(`[data-qa=prisoner-name]`)

  sexRadioButtons = (value): PageElement => cy.get('.govuk-radios__input[type="radio"]').check(value)

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
