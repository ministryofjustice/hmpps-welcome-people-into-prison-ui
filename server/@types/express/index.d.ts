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
      errors?: { text?: string; href: string }[]
      flash(): { [key: string]: any[] }
      flash(type: string, message: any): number
      flash(message: string): any[]
    }
  }
}
