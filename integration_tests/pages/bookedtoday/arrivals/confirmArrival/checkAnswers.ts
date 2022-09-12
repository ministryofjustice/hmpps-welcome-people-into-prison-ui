import Page, { PageElement } from '../../../page'

export default class CheckAnswersPage extends Page {
  constructor() {
    super('Check your answers before adding')
  }

  name = (): PageElement => cy.get('.data-qa-prisoner-name')

  dob = (): PageElement => cy.get('.data-qa-dob')

  prisonNumber = (): PageElement => cy.get('.data-qa-prison-number')

  pncNumber = (): PageElement => cy.get('.data-qa-pnc-number')

  sex = (): PageElement => cy.get('.data-qa-sex')

  reason = (): PageElement => cy.get('.data-qa-reason')

  checkDetails = ({
    prisonNumber,
    pncNumber,
    name,
    sex,
    dob,
    reason,
  }: {
    prisonNumber: string
    pncNumber: string
    name: string
    dob: string
    sex: string
    reason: string
  }) => {
    this.backNavigation().should('exist')
    this.name().should('contain.text', name)
    this.dob().should('contain.text', dob)
    this.prisonNumber().should('contain.text', prisonNumber)
    this.pncNumber().should('contain.text', pncNumber)
    this.sex().should('contain.text', sex)
    this.reason().should('contain.text', reason)
  }

  addToRoll = (): PageElement => cy.get('[data-qa=add-to-roll]')
}
