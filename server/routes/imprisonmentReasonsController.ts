import { RequestHandler } from 'express'
import ImprisonmentStatusesService from '../services/imprisonmentStatusesService'
import ExpectedArrivalsService from '../services/expectedArrivalsService'
import { getKeyByValue, urlParse } from '../utils/utils'
import * as urlMappings from './urlMappings.json'

export default class ImprisonmentStatusesController {
  public constructor(
    private readonly imprisonmentStatusesService: ImprisonmentStatusesService,
    private readonly expectedArrivalsService: ExpectedArrivalsService
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id, imprisonmentStatus } = req.params
      const statusDescription = getKeyByValue(urlMappings, imprisonmentStatus)
      const { movementReasons, secondLevelTitle } = await this.imprisonmentStatusesService.getImprisonmentStatus(
        statusDescription
      )

      const data = await this.expectedArrivalsService.getMove(id)
      return res.render('pages/imprisonmentReason.njk', {
        errors: req.flash('errors'),
        imprisonmentStatus,
        secondLevelTitle,
        movementReasons,
        data,
      })
    }
  }

  public assignReason(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params

      if (req.errors) {
        const url = req.originalUrl
        const redirectTo = urlParse(url, 1)
        req.flash('input', req.body)
        return res.redirect(`/prisoners/${id}/imprisonment-status/${redirectTo}`)
      }
      return res.redirect(`/prisoners/${id}/check-answers`)
    }
  }
}
