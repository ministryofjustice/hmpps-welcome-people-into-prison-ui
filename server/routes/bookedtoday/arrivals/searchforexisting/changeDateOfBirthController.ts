import type { RequestHandler } from 'express'
import { State } from './state'

export default class ChangeDateOfBirthController {
  public showChangeDateOfBirth(): RequestHandler {
    return async (req, res) => {
      const data = req.flash('input')[0] || State.searchDetails.get(req)
      res.render('pages/bookedtoday/arrivals/searchForExistingRecord/changeDateOfBirth.njk', {
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
        return res.redirect(`/prisoners/${id}/search-for-existing-record/change-date-of-birth`)
      }

      const { day, month, year } = req.body

      State.searchDetails.update(req, res, {
        dateOfBirth: `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
      })

      return res.redirect(`/prisoners/${id}/search-for-existing-record`)
    }
  }
}
