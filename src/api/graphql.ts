/**
 * @file api/graphql.ts
 * @description Centralized GraphQL client helper using VueUse useFetch.
 * Provides consistent error handling and configuration.
 */

import { useFetch } from '@vueuse/core'

interface GraphQLPayload {
  query: string
  variables?: Record<string, unknown>
}

interface GraphQLError {
  message: string
  locations?: { line: number; column: number }[]
  path?: string[]
}

interface GraphQLResponse<T> {
  data: T
  errors?: GraphQLError[]
}

/**
 * Executes a GraphQL query or mutation.
 * @param url The target GraphQL endpoint.
 * @param query The GraphQL query string.
 * @param variables Optional variables for the query.
 * @returns {Promise<T>} The result data.
 */
export async function queryGraphql<T>(
  url: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const payload: GraphQLPayload = { query, variables }

  const { data, error } = await useFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .post()
    .json<GraphQLResponse<T>>()

  if (error.value) {
    throw new Error(`Network Error: ${error.value}`)
  }

  const responseValue = data.value
  if (!responseValue) {
    throw new Error('GraphQL Error: No response from server')
  }

  if (responseValue.errors && responseValue.errors.length > 0) {
    const firstError = responseValue.errors[0]?.message || 'Unknown Error'
    throw new Error(`GraphQL Error: ${firstError}`)
  }

  if (!responseValue.data) {
    throw new Error('GraphQL Error: No data returned from server')
  }

  return responseValue.data
}
