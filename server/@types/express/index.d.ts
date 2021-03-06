export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      errors?: { text?: string; href: string }[]
      flash(): { [key: string]: unknown[] }
      flash(type: string, message: unknown): number
      flash(message: string): unknown[]
    }
  }
}
