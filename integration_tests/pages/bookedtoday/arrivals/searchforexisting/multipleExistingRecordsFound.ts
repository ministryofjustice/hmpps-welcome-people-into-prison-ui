import Page, { PageElement } from '../../../page'

export default class MultipleMatchingRecordsFoundPage extends Page {
  constructor() {
    super('Possible existing records have been found')
  }

  static goTo(id: string): MultipleMatchingRecordsFoundPage {
    cy.visit(`/prisoners/${id}/search-for-existing-record/possible-records-found`)
    return Page.verifyOnPage(MultipleMatchingRecordsFoundPage)
  }

  arrival = () => ({
    fieldName: name => cy.get(`.data-qa-per-record-${name}`),
  })

  prisonerImage = () => ({
    check({ href, alt }: { href: string; alt: string }) {
      Page.checkImage(cy.get(`[data-qa=prisoner-image]`), href, alt)
    },
  })

  searchAgain = (): PageElement => cy.get('[data-qa=ammend-search]')

  createNewDetailsReveal = (): PageElement => cy.get('[data-qa=create-new-details-reveal]')

  createNew = (): PageElement => cy.get('[data-qa=create-new]')

  chooseMatch = match => ({
    fieldName: name => cy.get(`.data-qa-matching-record-${match}-${name}`),
  })

  match = (index): PageElement => cy.get(`#record-${index}`)

  continue = (): PageElement => cy.get('[data-qa=continue]')
}
