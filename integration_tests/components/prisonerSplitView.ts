import { PageElement } from '../pages/page'

export default class PrisonerSplitViewComponent {
  perName = (): PageElement => cy.get(`.data-qa-per-record-prisoner-name`)

  perDob = (): PageElement => cy.get(`.data-qa-per-record-dob`)

  perPrisonNumber = (): PageElement => cy.get(`.data-qa-per-record-prison-number`)

  perPncNumber = (): PageElement => cy.get(`.data-qa-per-record-pnc-number`)

  existingName = (): PageElement => cy.get(`.data-qa-existing-record-prisoner-name`)

  existingDob = (): PageElement => cy.get(`.data-qa-existing-record-dob`)

  existingPrisonNumber = (): PageElement => cy.get(`.data-qa-existing-record-prison-number`)

  existingPncNumber = (): PageElement => cy.get(`.data-qa-existing-record-pnc-number`)
}
