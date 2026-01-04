/**
 * @file types/planet.ts
 * @description Type definitions for planet and RPC configuration.
 */

export type PlanetName = string

export interface RpcConfig {
  'dp.gql'?: string[]
  '9cscan.rest'?: string[]
  'headless.gql'?: string[]
  'headless.grpc'?: string[]
  'market.rest'?: string[]
  'world-boss.rest'?: string[]
  'patrol-reward.gql'?: string[]
  'arena.rest'?: string[]
  'arena.gql'?: string[]
  'mimir.gql'?: string[]
  [key: string]: string[] | undefined
}

export interface PlanetConfig {
  id: string
  name: PlanetName
  genesisHash: string
  genesisUri?: string
  '9cscanUrl'?: string
  rpcEndpoints: RpcConfig
}
