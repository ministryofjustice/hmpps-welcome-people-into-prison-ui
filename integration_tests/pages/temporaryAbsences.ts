import Page, { PageElement } from './page'

export default class TemporaryAbsences extends Page {
  constructor() {
    super('Select prisoner returning from temporary absence')
  }

  temporaryAbsences = (index: number): PageElement => cy.get(`[data-qa=temporaryAbsence-title-${index}]`)
}
