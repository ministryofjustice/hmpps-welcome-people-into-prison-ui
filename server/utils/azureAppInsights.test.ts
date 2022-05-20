import { EnvelopeTelemetry } from 'applicationinsights/out/Declarations/Contracts'
import { ClientRequest } from 'http'
import { addUserDataToRequests } from './azureAppInsights'

const user = {
  activeCaseLoadId: 'LII',
  isReceptionUser: true,
  username: 'test-user',
  activeCaseLoadDescription: 'Lincoln',
}

const createEnvelope = (properties: Record<string, string | boolean>, baseType = 'RequestData') =>
  ({
    data: {
      baseType,
      baseData: { properties },
    },
  } as unknown as EnvelopeTelemetry)

const createContext = (
  username: string,
  activeCaseLoadId: string,
  activeCaseLoadDescription: string,
  isReceptionUser: boolean
) =>
  ({
    'http.ServerRequest': {
      res: {
        locals: {
          user: {
            username,
            activeCaseLoadId,
            activeCaseLoad: { description: activeCaseLoadDescription },
            isReceptionUser,
          },
        },
      },
    },
  } as unknown as ClientRequest)

const context = createContext(
  user.username,
  user.activeCaseLoadId,
  user.activeCaseLoadDescription,
  user.isReceptionUser
)

describe('azureAppInsights', () => {
  describe('addUserDataToRequests', () => {
    it('adds user data to properties when present', () => {
      const envelope = createEnvelope({ other: 'things' })

      addUserDataToRequests(envelope, context)

      expect(envelope.data.baseData.properties).toStrictEqual({
        ...user,
        other: 'things',
      })
    })

    it('returns true when not RequestData type', () => {
      const envelope = createEnvelope({}, 'NOT_REQUEST_DATA')

      const response = addUserDataToRequests(envelope, context)

      expect(response).toStrictEqual(true)
    })

    it('handles when no properties have been set', () => {
      const envelope = createEnvelope(undefined)

      addUserDataToRequests(envelope, context)

      expect(envelope.data.baseData.properties).toStrictEqual(user)
    })

    it('handles missing user details', () => {
      const envelope = createEnvelope({ other: 'things' })

      addUserDataToRequests(envelope, {
        'http.ServerRequest': {},
      } as unknown as ClientRequest)

      expect(envelope.data.baseData.properties).toEqual({
        other: 'things',
      })
    })
  })
})
