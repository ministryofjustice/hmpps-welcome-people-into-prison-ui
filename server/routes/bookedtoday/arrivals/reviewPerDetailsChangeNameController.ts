import type { RequestHandler } from 'express'
import { State } from './state'

export default class ReviewPerDetailsChangeNameController {
  public showChangeName(): RequestHandler {
    return async (req, res) => {
      const data = req.flash('input')[0] || State.newArrival.get(req)
      res.render('pages/bookedtoday/arrivals/searchForExistingRecord/changeName.njk', {
        data,
        errors: req.flash('errors'),
      })
    }
  }

  public changeName(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      if (req.errors) {
        req.flash('input', req.body)
        return res.redirect(`/prisoners/${id}/review-per-details/change-name`)
      }
      const { firstName, lastName } = req.body
      State.newArrival.update(req, res, { firstName, lastName })
      return res.redirect(`/prisoners/${id}/review-per-details`)
    }
  }
}
