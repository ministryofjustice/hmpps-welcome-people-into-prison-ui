import type { RequestHandler } from 'express'
import { State } from './state'

export default class SexController {
  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params

      const data = State.newArrival.get(req)

      const genderValue = this.convertGenderKeyToValue(data.sex)

      if (genderValue) {
        State.newArrival.update(req, res, { sex: genderValue })
        return res.redirect(`/prisoners/${id}/imprisonment-status`)
      }

      return res.render('pages/bookedtoday/arrivals/sex.njk', {
        errors: req.flash('errors'),
        id,
        data,
      })
    }
  }

  public assignSex(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { sex } = req.body

      if (req.errors) {
        return res.redirect(`/prisoners/${id}/sex`)
      }

      State.newArrival.update(req, res, { sex })

      return res.redirect(`/prisoners/${id}/imprisonment-status`)
    }
  }

  private convertGenderKeyToValue(value: string): string {
    if (value?.toUpperCase() === 'MALE') return 'M'
    if (value?.toUpperCase() === 'FEMALE') return 'F'
    return null
  }
}
