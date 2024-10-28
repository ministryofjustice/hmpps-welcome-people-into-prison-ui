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
  serviceIsUnvailable: process.env.SERVICE_IS_UNAVAILABLE === 'true',
  serviceOutageBannerEnabled: get('SERVICE_OUTAGE_BANNER_ENABLED', 'false', requiredInProduction) === 'true',
  production,
  https: production,
  staticResourceCacheDuration: 20,
  phaseName: process.env.SYSTEM_PHASE,
  dpsUrl: get('DPS_URL', 'http://localhost:3000', requiredInProduction),
  newDpsUrl: get('NEW_DPS_URL', 'http://localhost:3000', requiredInProduction),
  environmentName: get('ENVIRONMENT_NAME', ''),
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
    hmppsManageUsersApi: {
      url: get('HMPPS_MANAGE_USERS_API_URL', 'http://localhost:8081', requiredInProduction),
      timeout: {
        response: Number(get('HMPPS_MANAGE_USERS_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_MANAGE_USERS_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: DEFAULT_AGENT_CONFIG,
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
    prisonRegister: {
      url: get('PRISON_REGISTER_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('PRISON_REGISTER_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('PRISON_REGISTER_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: DEFAULT_AGENT_CONFIG,
    },
    frontendComponents: {
      url: get('COMPONENT_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('COMPONENT_API_TIMEOUT_SECONDS', 2000)),
        deadline: Number(get('COMPONENT_API_TIMEOUT_SECONDS', 2000)),
      },
      agent: DEFAULT_AGENT_CONFIG,
    },
    bodyscan: {
      url: get('BODYSCAN_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('BODYSCAN_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('BODYSCAN_API_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: DEFAULT_AGENT_CONFIG,
    },
  },
  notifications: {
    notifyKey: get('NOTIFY_API_KEY', ''),
    feedbackEmail: get('FEEDBACK_EMAIL', ''),
    feedbackTemplateId: 'b753ee4e-f0fe-4788-b252-ac28631555f6',
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  analytics: {
    googleAnalyticsId: get('GOOGLE_ANALYTICS_ID', ''),
    tagManagerContainerId: get('TAG_MANAGER_CONTAINER_ID', ''),
    tagManagerEnvironment: get('TAG_MANAGER_ENVIRONMENT', ''),
  },
  enabledPrisons: get('ENABLED_PRISONS', '', requiredInProduction).split(','),
  femalePrisons: get('FEMALE_PRISONS', '', requiredInProduction).split(','),
  confirmEnabled: get('CONFIRM_ENABLED', 'false', requiredInProduction) === 'true',
  confirmCourtReturnEnabled: get('CONFIRM_COURT_RETURN_ENABLED', 'false', requiredInProduction) === 'true',
  confirmNoIdentifiersEnabled: get('CONFIRM_NO_IDENTIFIERS_ENABLED', 'false', requiredInProduction) === 'true',
  supportingMultitransactionsEnabled:
    get('SUPPORTING_MULTITRANSACTIONS_ENABLED', 'false', requiredInProduction) === 'true',
  eventPublishing: {
    serviceAccountKey: get('GOOGLE_SERVICE_ACCOUNT_KEY', '', requiredInProduction),
    spreadsheetId: get('EXPORT_SPREADSHEET_ID', '', requiredInProduction),
  },
  showExpectedArrivalPrisonerSummary:
    get('SHOW_EXPECTED_ARRIVAL_PRISONER_SUMMARY', 'false', requiredInProduction) === 'true',

  showPrisonTransferSummary: get('SHOW_PRISON_TRANSFER_SUMMARY', 'false', requiredInProduction) === 'true',
  showBreadCrumb: get('SHOW_BREADCRUMB', 'false', requiredInProduction) === 'true',
  showRecentArrivals: get('SHOW_RECENT_ARRIVALS', 'false', requiredInProduction) === 'true',
}
