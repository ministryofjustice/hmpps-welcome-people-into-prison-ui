import moment from 'moment'
import { PageElement } from '../pages/page'

export default class PrisonerSplitViewComponent {
  contains = (prisonerEscortRecordDetails, prisonRecordDetails) => {
    this.perName().should(
      'contain.text',
      `${prisonerEscortRecordDetails.firstName} ${prisonerEscortRecordDetails.lastName}`
    )
    this.perDob().should(
      'contain.text',
      moment(prisonerEscortRecordDetails.dateOfBirth, 'YYYY-MM-DD').format('D MMMM YYYY')
    )
    this.perPrisonNumber().should('contain.text', prisonerEscortRecordDetails.prisonNumber)
    this.perPncNumber().should('contain.text', prisonerEscortRecordDetails.pncNumber)

    this.existingName().should('contain.text', `${prisonRecordDetails.firstName} ${prisonRecordDetails.lastName}`)
    this.existingDob().should(
      'contain.text',
      moment(prisonRecordDetails.dateOfBirth, 'YYYY-MM-DD').format('D MMMM YYYY')
    )
    this.existingPrisonNumber().should('contain.text', prisonRecordDetails.prisonNumber)
    this.existingPncNumber().should('contain.text', prisonRecordDetails.pncNumber)
  }

  perName = (): PageElement => cy.get(`.data-qa-per-record-prisoner-name`)

  perDob = (): PageElement => cy.get(`.data-qa-per-record-dob`)

  perPrisonNumber = (): PageElement => cy.get(`.data-qa-per-record-prison-number`)

  perPncNumber = (): PageElement => cy.get(`.data-qa-per-record-pnc-number`)

  existingName = (): PageElement => cy.get(`.data-qa-existing-record-prisoner-name`)

  existingDob = (): PageElement => cy.get(`.data-qa-existing-record-dob`)

  existingPrisonNumber = (): PageElement => cy.get(`.data-qa-existing-record-prison-number`)

  existingPncNumber = (): PageElement => cy.get(`.data-qa-existing-record-pnc-number`)
}
