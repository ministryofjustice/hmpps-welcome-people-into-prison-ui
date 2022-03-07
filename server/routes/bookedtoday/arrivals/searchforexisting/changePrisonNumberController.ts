import type { RequestHandler } from 'express'
import { State } from './state'

export default class ChangePrisonNumberController {
  public showChangePrisonNumber(): RequestHandler {
    return async (req, res) => {
      const data = req.flash('input')[0] || State.searchDetails.get(req)
      res.render('pages/bookedtoday/arrivals/changeArrivalDetails/changePrisonNumber.njk', {
        data,
        errors: req.flash('errors'),
      })
    }
  }

  public changePrisonNumber(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      if (req.errors) {
        req.flash('input', req.body)
        return res.redirect(`/prisoners/${id}/search-for-existing-record/change-prison-number`)
      }
      const { prisonNumber } = req.body
      State.searchDetails.update(req, res, { prisonNumber })
      return res.redirect(`/prisoners/${id}/search-for-existing-record`)
    }
  }

  public removePrisonNumber(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      State.searchDetails.update(req, res, { prisonNumber: undefined })
      res.redirect(`/prisoners/${id}/search-for-existing-record`)
    }
  }
}
