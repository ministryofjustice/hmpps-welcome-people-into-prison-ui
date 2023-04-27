import { RequestHandler } from 'express'
import type { ImprisonmentStatusesService, ExpectedArrivalsService } from '../../../../services'
import { State } from '../state'
import type LockManager from '../../../../data/lockManager'
import logger from '../../../../../logger'

export default class CheckAnswersController {
  public constructor(
    private readonly expectedArrivalsService: ExpectedArrivalsService,
    private readonly imprisonmentStatusesService: ImprisonmentStatusesService,
    private readonly lockManager: LockManager
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

      const arrivalResponse = await this.expectedArrivalsService.confirmArrival(activeCaseLoadId, username, id, arrival)

      if (!arrivalResponse) {
        const lockDeleted = await this.lockManager.deleteLock(id)

        if (lockDeleted) {
          logger.info(`deletion of backtracking prevention lock for move id ${id} successful`)
        } else {
          logger.warn(`deletion of backtracking prevention lock for move id ${id} not successful`)
        }

        return res.redirect('/feature-not-available')
      }

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
