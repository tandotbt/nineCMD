/**
 * @file api/queries/character.ts
 * @description GraphQL queries for character-related data.
 * Re-exports queries from constants and uses builder for dynamic parts.
 */

import { GQL_QUERIES } from '@/constants'
import {
  buildAvatarBatchPart,
  buildAvatarDetailFullQuery,
  buildAvatarBatchQuery,
} from '../graphql_builder'

export const CHARACTER_QUERIES = {
  // Static templates from constants
  GET_AGENT_AVATARS: GQL_QUERIES.CHARACTER.GET_AGENT_AVATARS,
  GET_STAKE_STATE: GQL_QUERIES.CHARACTER.GET_STAKE_STATE,
  GET_AVATAR_MIMIR_SIMPLE: GQL_QUERIES.CHARACTER.GET_AVATAR_MIMIR_SIMPLE,

  // Dynamic builders
  AVATAR_BATCH_PART: buildAvatarBatchPart,
  GET_AVATAR_DETAIL_FULL: buildAvatarDetailFullQuery,
  BUILD_BATCH_QUERY: buildAvatarBatchQuery,

  // Templates from constants
  GET_AVATAR_MIMIR_FULL: GQL_QUERIES.CHARACTER.GET_AVATAR_MIMIR_SIMPLE,
} as const
