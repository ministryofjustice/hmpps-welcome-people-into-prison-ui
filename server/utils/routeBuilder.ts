/* eslint-disable max-classes-per-file */
import express, { RequestHandler, Router } from 'express'
import Role from '../authentication/role'
import asyncMiddleware from '../middleware/asyncMiddleware'
import forRoles from '../middleware/authorisationForUrlMiddleware'

export default class Routes {
  static forAnyRole(): Routes {
    return new Routes(express.Router(), [])
  }

  static forRole(role: Role): Routes {
    return new Routes(express.Router(), [role])
  }

  private constructor(private readonly router: Router, private readonly authorisedRoles: Role[]) {}

  private wrap = (handlers: RequestHandler[]) => handlers.map(handler => asyncMiddleware(handler))

  get(path: string, ...handlers: RequestHandler[]): Routes {
    this.router.get(path, forRoles(this.authorisedRoles), this.wrap(handlers))
    return this
  }

  post(path: string, ...handlers: RequestHandler[]): Routes {
    this.router.post(path, forRoles(this.authorisedRoles), this.wrap(handlers))
    return this
  }

  use(otherRouter: Router): Routes {
    this.router.use(otherRouter)
    return this
  }

  public forRole(role: Role): Routes {
    return new Routes(this.router, [role])
  }

  public build(): Router {
    return this.router
  }
}
