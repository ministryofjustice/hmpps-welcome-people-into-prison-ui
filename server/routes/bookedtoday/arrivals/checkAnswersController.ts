import { RequestHandler } from 'express'
import { Gender } from 'welcome'
import type { ImprisonmentStatusesService, ExpectedArrivalsService } from '../../../services'
import raiseAnalyticsEvent from '../../../raiseAnalyticsEvent'
import { getImprisonmentStatus, getSex } from './state'

export default class CheckAnswersController {
  public constructor(
    private readonly expectedArrivalsService: ExpectedArrivalsService,
    private readonly imprisonmentStatusesService: ImprisonmentStatusesService
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const statusAndReason = getImprisonmentStatus(req)
      const sex = getSex(req)
      const moveData = await this.expectedArrivalsService.getArrival(id)
      const reasonImprisonment = await this.imprisonmentStatusesService.getReasonForImprisonment(statusAndReason)
      const data = { sex, reasonImprisonment, ...moveData }
      return res.render('pages/bookedtoday/arrivals/checkAnswers.njk', { data })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res, next) => {
      const { id } = req.params
      const { username, activeCaseLoadId } = res.locals.user
      const data = await this.expectedArrivalsService.getArrival(id)
      const statusAndReason = getImprisonmentStatus(req)
      const sex = getSex(req) as Gender
      const newOffender = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: sex,
        prisonId: activeCaseLoadId,
        imprisonmentStatus: statusAndReason.imprisonmentStatus,
        movementReasonCode: statusAndReason.movementReasonCode,
      }

      const offenderNumber = await this.expectedArrivalsService.createOffenderRecordAndBooking(
        username,
        id,
        newOffender
      )

      if (!offenderNumber) {
        return res.redirect('/feature-not-available')
      }

      raiseAnalyticsEvent(
        'Add to the establishment roll',
        'Confirmed arrival',
        `AgencyId: ${activeCaseLoadId}, From: ${data.fromLocation}, Type: ${data.fromLocationType},`,
        req.hostname
      )

      req.flash('offenderNumber', offenderNumber.offenderNo)
      return res.redirect(`/prisoners/${id}/confirmation`)
    }
  }
}