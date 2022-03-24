import Page, { PageElement } from '../../page'

export default class SearchForExistingRecordPage extends Page {
  constructor() {
    super('Search for an existing prisoner record')
  }

  static goTo(): SearchForExistingRecordPage {
    cy.visit('/manually-confirm-arrival/search-for-existing-record')
    return Page.verifyOnPage(SearchForExistingRecordPage)
  }

  firstName = (): PageElement => cy.get('[data-qa=first-name]')

  lastName = (): PageElement => cy.get('[data-qa=last-name]')

  day = (): PageElement => cy.get('[data-qa=day]')

  month = (): PageElement => cy.get('[data-qa=month]')

  year = (): PageElement => cy.get('[data-qa=year]')

  otherSearchDetails = (): PageElement => cy.get('[data-qa=other-search-details]')

  prisonNumber = (): PageElement => cy.get('[data-qa=prison-number]')

  pncNumber = (): PageElement => cy.get('[data-qa=pnc-number]')

  search = (): PageElement => cy.get('[data-qa=search]')
}
