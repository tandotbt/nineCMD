export const LIST_API_NINECMD = [
  'https://api-1.9cmd.top',
  'https://api-2.9cmd.top',
  'https://api-3.9cmd.top'
]
// export const LIST_API_NINECMD = ['http://127.0.0.1:8000']
export const API_NINECMD = LIST_API_NINECMD[Math.floor(Math.random() * LIST_API_NINECMD.length)]
export const API_URL_PROXY = `${API_NINECMD}/proxy?url=`
export const API_NINE_CHRONICLES = 'https://nine-chronicles.com/api'
export const DEFAULT_LOCALE = 'en'
export const FALLBACK_LOCALE = 'en'
export const AVG_BLOCK = 8
export const AVG_TRANS = 100
export const URL_NINE_CHRONICLES_SERVE = [
  {
    planet: 'Odin',
    wss: 'wss://j3u7e1snee.execute-api.ap-northeast-2.amazonaws.com/production',
    arenaParticipate: 'https://jsonblob.com/api/1194537532422742016'
  },
  {
    planet: 'Heimdall',
    wss: 'wss://tsn0ilfyp5.execute-api.ap-northeast-2.amazonaws.com/production',
    arenaParticipate: 'https://jsonblob.com/api/1194537894173073408'
  }
]
export const URL_CONFIG_URL_ALL_PLANET = 'https://planets.nine-chronicles.com/planets/'
export const CONFIG_URL_ALL_PLANET = [
  {
    id: '0x000000000000',
    name: 'odin',
    genesisHash: '4582250d0da33b06779a8475d283d5dd210c683b9b999d74d03fac4f58fa6bce',
    genesisUri: 'https://release.nine-chronicles.com/genesis-block-9c-main',
    guildIconBucket: 'https://guild-odin.nine-chronicles.com',
    '9cscanUrl': 'https://9cscan.com',
    rpcEndpoints: {
      'dp.gql': ['http://odin-dp.9c.gg/graphql'],
      '9cscan.rest': ['https://api.9cscan.com'],
      'headless.gql': [
        'https://odin-rpc-1.nine-chronicles.com/graphql',
        'https://odin-rpc-2.nine-chronicles.com/graphql',
        'https://odin-rpc-3.nine-chronicles.com/graphql'
      ],
      'headless.grpc': [
        'http://odin-rpc-1.nine-chronicles.com:31238',
        'http://odin-rpc-2.nine-chronicles.com:31238',
        'http://odin-rpc-3.nine-chronicles.com:31238'
      ],
      'market.rest': ['https://odin-market.9c.gg'],
      'world-boss.rest': ['https://odin-world-boss.9c.gg'],
      'patrol-reward.gql': ['https://odin-patrol.9c.gg/graphql'],
      'guild.rest': ['https://guild-odin.nine-chronicles.com']
    },
    bridges: {
      '0x000000000001': {
        agent: '0x1c2ae97380CFB4F732049e454F6D9A25D4967c6f',
        avatar: '0x41aEFE4cdDFb57C9dFfd490e17e571705c593dDc'
      }
    }
  },
  {
    id: '0x000000000001',
    name: 'heimdall',
    genesisHash: '729fa26958648a35b53e8e3905d11ec53b1b4929bf5f499884aed7df616f5913',
    genesisUri: 'https://planets.nine-chronicles.com/planets/0x000000000001/genesis',
    guildIconBucket: 'https://guild.nine-chronicles.com',
    '9cscanUrl': 'https://heimdall.9cscan.com',
    rpcEndpoints: {
      'dp.gql': ['http://heimdall-dp.9c.gg/graphql'],
      '9cscan.rest': ['https://api-heimdall.9cscan.com'],
      'headless.gql': [
        'https://heimdall-rpc-1.nine-chronicles.com/graphql',
        'https://heimdall-rpc-2.nine-chronicles.com/graphql',
        'https://heimdall-rpc-3.nine-chronicles.com/graphql'
      ],
      'headless.grpc': [
        'http://heimdall-rpc-1.nine-chronicles.com:31238',
        'http://heimdall-rpc-2.nine-chronicles.com:31238',
        'http://heimdall-rpc-3.nine-chronicles.com:31238'
      ],
      'market.rest': ['http://heimdall-market.9c.gg'],
      'world-boss.rest': ['http://heimdall-world-boss.9c.gg'],
      'patrol-reward.gql': ['https://heimdall-patrol.9c.gg/graphql'],
      'guild.rest': ['https://guild.nine-chronicles.com']
    },
    bridges: {
      '0x000000000000': {
        agent: '0x1c2ae97380CFB4F732049e454F6D9A25D4967c6f',
        avatar: '0x41aEFE4cdDFb57C9dFfd490e17e571705c593dDc'
      }
    }
  }
]
export const CONFIG_GAME_CONFIG_SHEET = {
  hourglass_per_block: 3,
  action_point_max: 120,
  daily_reward_interval: 2550,
  daily_arena_interval: 7560,
  weekly_arena_interval: 56000,
  required_appraise_block: 0,
  battle_arena_interval: 4,
  rune_stat_slot_unlock_cost: 100,
  rune_skill_slot_unlock_cost: 1000,
  rune_stat_slot_crystal_unlock_cost: 5000000,
  rune_skill_slot_crystal_unlock_cost: 50000000,
  daily_rune_reward_amount: 1,
  daily_worldboss_interval: 10800,
  worldboss_required_interval: 5,
  stake_regular_fixed_reward_sheet_v2_start_block_index: 1,
  stake_regular_reward_sheet_v2_start_block_index: 1,
  stake_regular_reward_sheet_v3_start_block_index: 2,
  stake_regular_reward_sheet_v4_start_block_index: 3,
  stake_regular_reward_sheet_v5_start_block_index: 4,
  character_full_costume_slot: 1,
  character_hair_costume_slot: 1,
  character_ear_costume_slot: 1,
  character_eye_costume_slot: 1,
  character_tail_costume_slot: 1,
  character_title_costume_slot: 1,
  character_equipment_slot_weapon: 1,
  character_equipment_slot_armor: 1,
  character_equipment_slot_belt: 1,
  character_equipment_slot_necklace: 1,
  character_equipment_slot_ring1: 1,
  character_equipment_slot_ring2: 1,
  character_equipment_slot_aura: 1,
  character_consumable_slot_1: 1,
  character_consumable_slot_2: 35,
  character_consumable_slot_3: 100,
  character_consumable_slot_4: 200,
  character_consumable_slot_5: 350
}

import { enUS, dateEnUS, viVN, dateViVN } from 'naive-ui'
export const CONFIG_i18n_LANGUAGES = [
  {
    lang: 'vi',
    label: 'Tiếng Việt',
    description: 'Xin chào Chín Biên Niên Sử👋',
    png: 'https://flagcdn.com/w320/vn.png',
    uiConfig: viVN,
    uiConfigDate: dateViVN
  },
  {
    lang: 'en',
    label: 'English',
    description: 'Hello Nine Chronicles👋',
    png: 'https://flagcdn.com/w320/us.png',
    uiConfig: enUS,
    uiConfigDate: dateEnUS
  }
]

export const COST_AP_BY_STAKE = [
  { ncgStake: 5000, costAP: 5 },
  { ncgStake: 500000, costAP: 4 }
]
export const COST_AP_BY_STAKE_MIN = 3
export const LINK_BANNER =
  'https://raw.githubusercontent.com/planetarium/NineChronicles.LiveAssets/main/Assets/Json/Event.json'

export const TIMEOUT_USE_NODE = 6
export const WAIT_CHECK_TX = 30000 //ms
export const LIST_ACTIONS_AVAILABLE = {
  refillAP: 'daily_reward7',
  sweep: 'hack_and_slash_sweep10',
  repeat: 'hack_and_slash22',
  apPotion: 'charge_action_point3',
  craft: 'combination_equipment17',
  craftFood: 'combination_consumable9',
  upgrade: 'item_enhancement14',
  battleArena: 'battle_arena15',
  worldBoss: 'raid7',
  eventDungeonAttack: 'event_dungeon_battle6'
}
export const TIME_RETRY = {
  timeRetryMax: 3,
  timeRetryGetIDMax: 5,
  timeRetryCheckSuccessMax: 5,
  timeRetryYourServerMax: 5,
  timeRetry9cmdServerMax: 5
}

export const DISPLAY_9CMD = {
  drawerSize: '70%',
  drawerSizeMax: '100%'
}
export const LOGIN_YOUR_SERVER = {
  username: 'admin',
  password: 'admin'
}
