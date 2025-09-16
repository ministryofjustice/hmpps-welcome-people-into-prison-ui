import type { RequestHandler } from 'express'
import { path } from 'static-path'
import logger from '../../../../../logger'
import { type ExpectedArrivalsService } from '../../../../services'
import { type NewArrival, State } from '../state'

const urls = {
  sex: path('/prisoners/:id/sex'),
  transfers: path('/prisoners/:prisonNumber/check-transfer'),
  temporaryAbsence: path('/prisoners/:prisonNumber/check-temporary-absence'),
  featureNotAvailable: path('/feature-not-available'),
}

export default class StartConfirmationController {
  constructor(private readonly expectedArrivalService: ExpectedArrivalsService) {}

  public async getRedirectLocation(id: string, arrival: NewArrival): Promise<string> {
    const { prisonNumber } = arrival

    if (!prisonNumber) {
      return urls.sex({ id })
    }

    const prisoner = await this.expectedArrivalService.getPrisonerDetails(arrival.prisonNumber)
    logger.info(`Movement type description for arrival: ${id}, is ${prisoner.arrivalTypeDescription}`)

    switch (prisoner.arrivalType) {
      case 'NEW_BOOKING':
        return urls.sex({ id })

      case 'FROM_COURT':
        return urls.featureNotAvailable({})

      case 'FROM_TEMPORARY_ABSENCE':
        return arrival.expected
          ? `${urls.temporaryAbsence({ prisonNumber })}?arrivalId=${id}`
          : urls.temporaryAbsence({ prisonNumber })

      case 'TRANSFER':
        return arrival.expected
          ? `${urls.transfers({ prisonNumber })}?arrivalId=${id}`
          : urls.transfers({ prisonNumber })

      case 'CURRENTLY_IN':
      case 'UNKNOWN':
      default: {
        logger.error(
          `Unexpected arrival type for arrival: ${id}, type: ${prisoner.arrivalType}:${prisoner.arrivalTypeDescription}`,
        )
        return urls.featureNotAvailable({})
      }
    }
  }

  public redirect(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params

      const data = State.newArrival.get(req)

      const redirectLocation = await this.getRedirectLocation(id, data)
      logger.info(`Redirecting to: ${redirectLocation}`)
      return res.redirect(redirectLocation)
    }
  }
}
