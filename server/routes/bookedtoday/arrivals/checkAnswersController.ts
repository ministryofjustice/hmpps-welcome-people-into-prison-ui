import { RequestHandler } from 'express'
import { Gender, NewOffenderBooking } from 'welcome'
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
      const moveData = State.newArrival.get(req)
      const { code, imprisonmentStatus, movementReasonCode } = State.newArrival.get(req)
      const statusAndReason = { code, imprisonmentStatus, movementReasonCode }

      const reasonImprisonment = await this.imprisonmentStatusesService.getReasonForImprisonment(statusAndReason)
      const data = { reasonImprisonment, ...moveData }
      return res.render('pages/bookedtoday/arrivals/checkAnswers.njk', { id, data })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res, next) => {
      const { id } = req.params
      const { username, activeCaseLoadId } = res.locals.user
      const arrival = State.newArrival.get(req)
      const data = await this.expectedArrivalsService.getArrival(id)

      const newOffender: NewOffenderBooking = {
        firstName: arrival.firstName,
        lastName: arrival.lastName,
        dateOfBirth: arrival.dateOfBirth,
        gender: arrival.sex as Gender,
        prisonId: activeCaseLoadId,
        imprisonmentStatus: arrival.imprisonmentStatus,
        movementReasonCode: arrival.movementReasonCode,
        prisonNumber: arrival.prisonNumber,
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

      req.flash('arrivalResponse', {
        firstName: arrival.firstName,
        lastName: arrival.lastName,
        prisonNumber: arrivalResponse.prisonNumber,
        location: arrivalResponse.location,
      })
      return res.redirect(`/prisoners/${id}/confirmation`)
    }
  }
}
