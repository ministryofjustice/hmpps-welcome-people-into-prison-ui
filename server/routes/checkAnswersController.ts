import { RequestHandler } from 'express'
import { Gender } from 'welcome'
import type ExpectedArrivalsService from '../services/expectedArrivalsService'
import type ImprisonmentStatusesService from '../services/imprisonmentStatusesService'
import raiseAnalyticsEvent from '../raiseAnalyticsEvent'
import { getImprisonmentStatus } from './state'

export default class CheckAnswersController {
  public constructor(
    private readonly expectedArrivalsService: ExpectedArrivalsService,
    private readonly imprisonmentStatusesService: ImprisonmentStatusesService
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const statusAndReason = getImprisonmentStatus(req)
      const moveData = await this.expectedArrivalsService.getMove(id)
      const reasonImprisonment = await this.imprisonmentStatusesService.getReasonForImprisonment(statusAndReason)
      const data = { reasonImprisonment, ...moveData }
      return res.render('pages/checkAnswers.njk', { data })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { username, activeCaseLoadId } = res.locals.user
      const data = await this.expectedArrivalsService.getMove(id)
      const statusAndReason = getImprisonmentStatus(req)
      const newOffender = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: Gender.NOT_SPECIFIED,
        prisonId: activeCaseLoadId,
        imprisonmentStatus: statusAndReason.imprisonmentStatus,
        movementReasonCode: statusAndReason.movementReasonCode,
      }

      const offenderNumber = await this.expectedArrivalsService.createOffenderRecordAndBooking(
        username,
        id,
        newOffender
      )

      raiseAnalyticsEvent(
        'Add to the establishment roll',
        'Confirmed arrival',
        `AgencyId: ${activeCaseLoadId}, From: ${data.fromLocation}, Type: ${data.fromLocationType},`,
        req.hostname
      )

      req.flash('offenderNumber', offenderNumber.offenderNo)
      res.redirect(`/prisoners/${id}/confirmation`)
    }
  }
}
