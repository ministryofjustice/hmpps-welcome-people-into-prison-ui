import Page, { PageElement } from '../../../page'
import PrisonerSplitViewComponent from '../../../../components/prisonerSplitView'

export default class SingleMatchingRecordFoundPage extends Page {
  prisonerSplitView: PrisonerSplitViewComponent

  constructor() {
    super('This person has an existing prisoner record')
    this.prisonerSplitView = new PrisonerSplitViewComponent()
  }

  prisonerImage = (): PageElement => cy.get(`[data-qa=prisoner-image]`)

  continue = (): PageElement => cy.get(`[data-qa=continue]`)

  search = (): PageElement => cy.get('[data-qa=search-instead]')
}
