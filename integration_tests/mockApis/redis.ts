import { createRedisClient } from '../../server/data/redisClient'

const resetRedisDb = async () => {
  const client = createRedisClient()
  await client.connect()
  await client.flushDb()
  return null
}

export default resetRedisDb
