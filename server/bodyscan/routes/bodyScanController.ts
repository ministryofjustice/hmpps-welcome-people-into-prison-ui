import { RequestHandler } from 'express'
import moment from 'moment'
import { BodyScanService } from '../services'
import parseBodyScan from '../services/bodyScan'

export default class BodyScanController {
  public constructor(private readonly bodyScanService: BodyScanService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const today = moment().format('YYYY-MM-DD')
      const prisonerDetails = await this.bodyScanService.getPrisonerDetails(prisonNumber)
      const bodyScanInfo = await this.bodyScanService.retrieveBodyScanInfo(prisonNumber)
      return res.render('pages/bodyscans/recordBodyScan.njk', {
        errors: req.flash('errors'),
        today,
        prisonerDetails,
        bodyScanInfo,
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

      const bodyScan = parseBodyScan(req.body)
      await this.bodyScanService.addBodyScan(req.user.username, prisonNumber, bodyScan)
      req.flash('body-scan', bodyScan)

      return res.redirect(`/prisoners/${prisonNumber}/scan-confirmation`)
    }
  }
}
