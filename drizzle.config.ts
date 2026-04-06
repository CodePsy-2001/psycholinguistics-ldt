import assert from 'node:assert'
import { defineConfig } from 'drizzle-kit'

const DATABASE_URL = process.env.DATABASE_URL
const DATABASE_TOKEN = process.env.DATABASE_TOKEN
assert(DATABASE_URL, 'DATABASE_URL is not set.')
assert(DATABASE_TOKEN, 'DATABASE_TOKEN is not set.')

export default defineConfig({
  dialect: 'turso',
  schema: './db/schema.ts',
  dbCredentials: {
    url: DATABASE_URL,
    authToken: DATABASE_TOKEN,
  },
})
