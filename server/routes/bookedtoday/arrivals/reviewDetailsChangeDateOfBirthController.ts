import type { RequestHandler } from 'express'
import { createDate } from '../../../utils/utils'
import { State } from './state'

export default class ReviewDetailsChangeDateOfBirthController {
  public showChangeDateOfBirth(): RequestHandler {
    return async (req, res) => {
      const data = req.flash('input')[0] || State.newArrival.get(req)
      res.render('pages/bookedtoday/arrivals/changeDateOfBirth.njk', {
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
      State.newArrival.update(req, res, { dateOfBirth: createDate(day, month, year) })

      return res.redirect(`/prisoners/${id}/review-per-details`)
    }
  }
}
