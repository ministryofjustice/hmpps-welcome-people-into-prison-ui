import type { RequestHandler } from 'express'
import { State } from './state'

export default class ReviewPerDetailsChangeDateOfBirthController {
  public showChangeDateOfBirth(): RequestHandler {
    return async (req, res) => {
      const data = req.flash('input')[0] || State.newArrival.get(req)
      res.render('pages/bookedtoday/arrivals/changeArrivalDetails/changeDateOfBirth.njk', {
        data,
        errors: req.flash('errors'),
      })
    }
  }

  public changeDateOfBirth(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params

      if (req.errors) {
        req.flash('input', req.body)
        return res.redirect(`/prisoners/${id}/review-per-details/change-date-of-birth`)
      }

      const { day, month, year } = req.body

      State.newArrival.update(req, res, {
        dateOfBirth: `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
      })

      return res.redirect(`/prisoners/${id}/review-per-details`)
    }
  }
}
