import Page, { PageElement } from '../../page'

export default class ImprisonmentStatusPage extends Page {
  constructor() {
    super('What is the reason for imprisonment?')
  }

  prisonerName = (): PageElement => cy.get(`[data-qa=prisoner-name]`)

  imprisonmentStatusRadioButton = (value): PageElement => cy.get('.govuk-radios__input[type="radio"]').check(value)

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
