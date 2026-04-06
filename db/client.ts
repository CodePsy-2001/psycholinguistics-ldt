import assert from 'node:assert'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

import * as schema from './schema.ts'

const DATABASE_URL = process.env.DATABASE_URL
const DATABASE_TOKEN = process.env.DATABASE_TOKEN
assert(DATABASE_URL, 'DATABASE_URL is not set.')
assert(DATABASE_TOKEN, 'DATABASE_TOKEN is not set.')

const client = createClient({ url: DATABASE_URL, authToken: DATABASE_TOKEN })

export const db = drizzle({ client, schema })
export { client }
