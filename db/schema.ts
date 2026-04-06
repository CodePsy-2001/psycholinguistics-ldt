import { sql } from 'drizzle-orm'
import {
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'

const now = sql`(cast((julianday('now') - 2440587.5) * 86400000 as integer))`

export const participants = sqliteTable('participants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('external_code').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(now),
})

export const sessions = sqliteTable(
  'sessions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    participantId: integer('participant_id')
      .notNull()
      .references(() => participants.id),
    startedAt: integer('started_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(now),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
    status: text('status', { enum: ['IN_PROGRESS', 'DONE', 'ABORTED'] })
      .notNull()
      .default('IN_PROGRESS'),
  },
  (table) => [index('sessions_participant_id_idx').on(table.participantId)],
)

export const stimuli = sqliteTable(
  'stimuli',
  {
    text: text('text').primaryKey(),
    lexicality: integer('lexicality', { mode: 'boolean' }).notNull(),
    emotion: integer('emotion'),
    origin: text('origin', { enum: ['한자어', '순우리말'] }),
    logFreq: integer('log_freq'),
    orthN: integer('orth_n').notNull(),
    phonN: integer('phon_n').notNull(),
  },
  (table) => [
    index('stimuli_lexicality_idx').on(table.lexicality),
    index('stimuli_emotion_idx').on(table.emotion),
  ],
)

export const sessionTrials = sqliteTable(
  'session_trials',
  {
    sessionId: integer('session_id')
      .notNull()
      .references(() => sessions.id),
    trialIndex: integer('trial_index').notNull(),
    stimulus: text('stimulus')
      .notNull()
      .references(() => stimuli.text),
  },
  (table) => [
    primaryKey({ columns: [table.sessionId, table.trialIndex] }),
    index('session_trials_session_id_idx').on(table.sessionId),
    index('session_trials_stimulus_id_idx').on(table.stimulus),
  ],
)

export const trialResults = sqliteTable(
  'trial_results',
  {
    sessionId: integer('session_id').notNull(),
    trialIndex: integer('trial_index').notNull(),
    presentedAt: integer('presented_at', { mode: 'timestamp_ms' }),
    responseLexicality: integer('response_lexicality', { mode: 'boolean' }),
    rtMs: integer('rt_ms'),
    isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
    timedOut: integer('timed_out', { mode: 'boolean' })
      .notNull()
      .default(false),
  },
  (table) => [
    primaryKey({ columns: [table.sessionId, table.trialIndex] }),
    foreignKey({
      columns: [table.sessionId, table.trialIndex],
      foreignColumns: [sessionTrials.sessionId, sessionTrials.trialIndex],
      name: 'trial_results_session_trial_fk',
    }),
  ],
)
