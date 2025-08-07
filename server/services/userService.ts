import type { UserCaseLoad } from 'welcome'
import { convertToTitleCase } from '../utils/utils'
import type { RestClientBuilder, WelcomeClient, HmppsAuthClient } from '../data'

interface UserDetails {
  name: string
  displayName: string
  activeCaseLoadId?: string
}

export default class UserService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeClientFactory: RestClientBuilder<WelcomeClient>,
  ) {}

  async getUser(token: string): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getUser(token)
    return { ...user, displayName: convertToTitleCase(user.name as string) }
  }

  async getUserCaseLoads(token: string): Promise<UserCaseLoad[]> {
    const allUserCaseLoads = await this.welcomeClientFactory(token).getUserCaseLoads()
    return allUserCaseLoads
  }
}
