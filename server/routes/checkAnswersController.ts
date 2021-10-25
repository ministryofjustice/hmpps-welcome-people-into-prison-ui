import { RequestHandler } from 'express'
import ExpectedArrivalsService from '../services/expectedArrivalsService'

export default class CheckAnswersController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const data = await this.expectedArrivalsService.getMove(id)
      return res.render('pages/checkAnswers.njk', { data })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { username, activeCaseLoadId } = res.locals.user
      const data = await this.expectedArrivalsService.getMove(id)
      const newOffender = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: 'M',
        prisonId: activeCaseLoadId,
        imprisonmentStatus: 'RX',
        movementReasonCode: 'N',
      }
      const offenderNumber = await this.expectedArrivalsService.createOffenderRecordAndBooking(
        username,
        id,
        newOffender
      )
      req.flash('offenderNumber', offenderNumber.offenderNo)
      res.redirect(`/prisoners/${id}/confirmation`)
    }
  }
}
