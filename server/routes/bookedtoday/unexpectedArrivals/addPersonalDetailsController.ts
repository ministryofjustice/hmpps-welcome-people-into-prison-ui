import type { RequestHandler, Response, Request } from 'express'
import { createDate, convertToTitleCase } from '../../../utils/utils'
import { State } from '../arrivals/state'

export default class AddPersonalDetailsController {
  public view(): RequestHandler {
    return async (req: Request, res: Response) => {
      res.render('pages/unexpectedArrivals/addPersonalDetails.njk', {
        errors: req.flash('errors'),
        data: req.flash('input')[0],
      })
    }
  }

  public submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      if (req.errors) {
        req.flash('input', req.body)
        return res.redirect('/manually-confirm-arrival/add-personal-details')
      }

      const { firstName, lastName, year, month, day, sex } = req.body
      const dateOfBirth = createDate(day, month, year)

      State.newArrival.set(res, {
        firstName: convertToTitleCase(firstName),
        lastName: convertToTitleCase(lastName),
        dateOfBirth,
        sex,
      })

      return res.redirect('/prisoners/unexpected-arrivals/imprisonment-status')
    }
  }
}
