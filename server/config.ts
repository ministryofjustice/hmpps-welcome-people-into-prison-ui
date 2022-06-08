import 'dotenv/config'
import os from 'os'

const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

export interface ApiConfig {
  url: string
  timeout: {
    response: number
    deadline: number
  }
  agent: {
    maxSockets: number
    maxFreeSockets: number
    freeSocketTimeout: number
  }
}

export type AgentConfig = Readonly<ApiConfig['agent']>

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  maxSockets: 100,
  maxFreeSockets: 10,
  freeSocketTimeout: 30000,
}

export default {
  https: production,
  staticResourceCacheDuration: 20,
  phaseName: process.env.SYSTEM_PHASE,
  dpsUrl: get('DPS_URL', 'http://localhost:3000', requiredInProduction),
  hostname: process.env.APP_HOSTNAME || os.hostname(),
  redis: {
    host: get('REDIS_HOST', 'localhost', requiredInProduction),
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  session: {
    name: process.env.HMPPS_COOKIE_NAME || 'hmpps-session-dev',
    domain: process.env.APP_HOSTNAME || 'localhost',
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', 120)),
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: DEFAULT_AGENT_CONFIG,
      apiClientId: get('API_CLIENT_ID', 'clientid', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'clientid', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: DEFAULT_AGENT_CONFIG,
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
    welcome: {
      url: get('WELCOME_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('WELCOME_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('WELCOME_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: DEFAULT_AGENT_CONFIG,
    },
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  analytics: {
    googleAnalyticsId: get('GOOGLE_ANALYTICS_ID', ''),
    tagManagerContainerId: get('TAG_MANAGER_CONTAINER_ID', ''),
    tagManagerEnvironment: get('TAG_MANAGER_ENVIRONMENT', ''),
  },
  enabledPrisons: get('ENABLED_PRISONS', '', requiredInProduction).split(','),
  confirmEnabled: get('CONFIRM_ENABLED', 'false', requiredInProduction) === 'true',
  confirmCourtReturnEnabled: get('CONFIRM_COURT_RETURN_ENABLED', 'false', requiredInProduction) === 'true',
  confirmNoIdentifiersEnabled: get('CONFIRM_NO_IDENTIFIERS_ENABLED', 'false', requiredInProduction) === 'true',
  temporaryAbsencesEnabled: get('TEMPORARY_ABSENCE_ENABLED', 'false', requiredInProduction) === 'true',
  supportingMultitransactionsEnabled:
    get('SUPPORTING_MULTITRANSACTIONS_ENABLED', 'false', requiredInProduction) === 'true',
}
