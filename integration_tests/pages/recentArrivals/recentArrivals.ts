import Page, { PageElement } from '../page'

export default class RecentArrivalsPage extends Page {
  constructor() {
    super('Prisoners who have arrived in the last 3 days')
  }

  static goTo(): RecentArrivalsPage {
    cy.visit('/recent-arrivals')
    return Page.verifyOnPage(RecentArrivalsPage)
  }

  searchInput = (): PageElement => cy.get('[data-qa=recent-arrival-search-input]')

  searchSubmit = (): PageElement => cy.get('[data-qa=recent-arrival-search-submit]')

  recentArrivals = (row: number, date: string): Record<string, () => PageElement> => ({
    name: () => cy.get(`[data-qa=${date}-title-${row}]`),
    prisonNumber: () => cy.get(`[data-qa=${date}-prison-number-${row}]`),
    dob: () => cy.get(`[data-qa=${date}-dob-${row}]`),
    movementDateTime: () => cy.get(`[data-qa=${date}-movementDateTime-${row}]`),
    location: () => cy.get(`[data-qa=${date}-location-${row}]`),
    doNotScan: () => cy.get(`[data-qa=recent-arrival-${date}-${row}] [data-qa=do-not-scan]`),
  })

  noRecentArrivlsOnDay = (date: string): PageElement => cy.get(`[data-qa=no-prisoners-${date}`)

  prisonerImage = (index: number) => ({
    check({ href, alt }: { href: string; alt: string }) {
      Page.checkImage(cy.get(`[data-qa=prisoner-image]`).eq(index), href, alt)
    },
  })
}
