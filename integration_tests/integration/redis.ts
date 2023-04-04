import { createRedisClient } from '../../server/data/redisClient'

const resetRedisDb = async () => {
  const client = createRedisClient({ legacyMode: false })
  await client.connect()
  client.flushDb()
  return null
}

export default resetRedisDb
