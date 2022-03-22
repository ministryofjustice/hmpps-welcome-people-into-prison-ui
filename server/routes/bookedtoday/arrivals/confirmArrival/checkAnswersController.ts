import { RequestHandler } from 'express'
import { Sex, ConfirmArrivalDetail } from 'welcome'
import type { ImprisonmentStatusesService, ExpectedArrivalsService, RaiseAnalyticsEvent } from '../../../../services'
import { State } from '../state'

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
      const pageToRender = data.prisonNumber ? 'checkAnswers' : 'checkAnswersForCreateNewRecord'
      return res.render(`pages/bookedtoday/arrivals/confirmArrival/${pageToRender}.njk`, { id, data })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res, next) => {
      const { id } = req.params
      const { username, activeCaseLoadId } = res.locals.user
      const arrival = State.newArrival.get(req)
      const data = await this.expectedArrivalsService.getArrival(id)

      const detail: ConfirmArrivalDetail = {
        firstName: arrival.firstName,
        lastName: arrival.lastName,
        dateOfBirth: arrival.dateOfBirth,
        sex: arrival.sex as Sex,
        prisonId: activeCaseLoadId,
        imprisonmentStatus: arrival.imprisonmentStatus,
        movementReasonCode: arrival.movementReasonCode,
        fromLocationId: data.fromLocationId,
        prisonNumber: arrival.prisonNumber,
      }

      const arrivalResponse = await this.expectedArrivalsService.confirmArrival(username, id, detail)

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
