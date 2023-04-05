import Page, { PageElement } from '../page'

export default class RecentArrivalsSearchPage extends Page {
  constructor() {
    super('People who have arrived in the last 3 days')
  }

  static goTo(): RecentArrivalsSearchPage {
    cy.visit('/recent-arrivals/search')
    return Page.verifyOnPage(RecentArrivalsSearchPage)
  }

  searchInput = (): PageElement => cy.get('[data-qa=recent-arrival-search-input]')

  searchSubmit = (): PageElement => cy.get('[data-qa=recent-arrival-search-submit]')

  clearSearch = (): PageElement => cy.get('[data-qa=clear-search]')

  recentArrivals = (row: number): Record<string, () => PageElement> => ({
    name: () => cy.get(`[data-qa=-title-${row}]`),
  })

  noResultsFound = (): PageElement => cy.get('[data-qa=no-results-found]')
}
