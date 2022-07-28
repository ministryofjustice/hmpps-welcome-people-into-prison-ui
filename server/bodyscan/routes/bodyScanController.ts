import { RequestHandler } from 'express'
import moment from 'moment'
import { BodyScanService } from '../services'

export default class BodyScanController {
  public constructor(private readonly bodyScanService: BodyScanService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const today = moment().format('YYYY-MM-DD')
      const prisonerDetails = await this.bodyScanService.getPrisonerDetails(prisonNumber)
      return res.render('pages/bodyscans/recordBodyScan.njk', {
        errors: req.flash('errors'),
        today,
        prisonerDetails,
        data: req.flash('input')[0],
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      if (req.errors) {
        req.flash('input', req.body)
        return res.redirect(`/prisoners/${prisonNumber}/record-body-scan`)
      }

      return res.redirect(`/prisoners/${prisonNumber}/record-body-scan`)
    }
  }
}
