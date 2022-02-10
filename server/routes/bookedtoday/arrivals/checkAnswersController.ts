import { RequestHandler } from 'express'
import { Gender } from 'welcome'
import type { ImprisonmentStatusesService, ExpectedArrivalsService, RaiseAnalyticsEvent } from '../../../services'
import { State } from './state'

export default class CheckAnswersController {
  public constructor(
    private readonly expectedArrivalsService: ExpectedArrivalsService,
    private readonly imprisonmentStatusesService: ImprisonmentStatusesService,
    private readonly raiseAnalyticsEvent: RaiseAnalyticsEvent
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const statusAndReason = State.imprisonmentStatus.get(req)
      const sex = State.sex.get(req)
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
      const statusAndReason = State.imprisonmentStatus.get(req)
      const sex = State.sex.get(req)

      const newOffender = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: sex as Gender,
        prisonId: activeCaseLoadId,
        imprisonmentStatus: statusAndReason.imprisonmentStatus,
        movementReasonCode: statusAndReason.movementReasonCode,
      }

      const arrivalResponse = await this.expectedArrivalsService.createOffenderRecordAndBooking(
        username,
        id,
        newOffender
      )

      if (!arrivalResponse) {
        return res.redirect('/feature-not-available')
      }

      this.raiseAnalyticsEvent(
        'Add to the establishment roll',
        'Confirmed arrival',
        `AgencyId: ${activeCaseLoadId}, From: ${data.fromLocation}, Type: ${data.fromLocationType},`,
        req.hostname
      )

      req.flash('location', arrivalResponse.location)
      return res.redirect(`/prisoners/${id}/confirmation`)
    }
  }
}
