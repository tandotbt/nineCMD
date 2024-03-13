export const API_BASE_URL = 'https://api.example.com'
export const DEFAULT_LOCALE = 'en'
export const FALLBACK_LOCALE = 'en'
export const AVG_BLOCK = 8
export const AVG_TRANS = 100
export const URL_NINE_CHRONICLES_SERVE = [
  {
    planet: 'Odin',
    wss: 'wss://j3u7e1snee.execute-api.ap-northeast-2.amazonaws.com/production',
    arenaParticipate: "https://jsonblob.com/api/1194537532422742016"
  },
  {
    planet: 'Heimdall',
    wss: 'wss://tsn0ilfyp5.execute-api.ap-northeast-2.amazonaws.com/production',
    arenaParticipate: "https://jsonblob.com/api/1194537739986264064"
  },
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
      'headless.gql': ['https://odin-rpc-1.nine-chronicles.com/graphql', 'https://odin-rpc-2.nine-chronicles.com/graphql', 'https://odin-rpc-3.nine-chronicles.com/graphql'],
      'headless.grpc': ['http://odin-rpc-1.nine-chronicles.com:31238', 'http://odin-rpc-2.nine-chronicles.com:31238', 'http://odin-rpc-3.nine-chronicles.com:31238'],
      'market.rest': ['https://odin-market.9c.gg'],
      'world-boss.rest': ['https://odin-world-boss.9c.gg'],
      'patrol-reward.gql': ['https://odin-patrol.9c.gg/graphql'],
      'guild.rest': ['https://guild-odin.nine-chronicles.com'],
    },
    bridges: {
      '0x000000000001': {
        agent: '0x1c2ae97380CFB4F732049e454F6D9A25D4967c6f',
        avatar: '0x41aEFE4cdDFb57C9dFfd490e17e571705c593dDc',
      },
    },
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
      'headless.gql': ['https://heimdall-rpc-1.nine-chronicles.com/graphql', 'https://heimdall-rpc-2.nine-chronicles.com/graphql', 'https://heimdall-rpc-3.nine-chronicles.com/graphql'],
      'headless.grpc': ['http://heimdall-rpc-1.nine-chronicles.com:31238', 'http://heimdall-rpc-2.nine-chronicles.com:31238', 'http://heimdall-rpc-3.nine-chronicles.com:31238'],
      'market.rest': ['http://heimdall-market.9c.gg'],
      'world-boss.rest': ['http://heimdall-world-boss.9c.gg'],
      'patrol-reward.gql': ['https://heimdall-patrol.9c.gg/graphql'],
      'guild.rest': ['https://guild.nine-chronicles.com'],
    },
    bridges: {
      '0x000000000000': {
        agent: '0x1c2ae97380CFB4F732049e454F6D9A25D4967c6f',
        avatar: '0x41aEFE4cdDFb57C9dFfd490e17e571705c593dDc',
      },
    },
  },
]
import { enUS, dateEnUS, viVN, dateViVN } from 'naive-ui'
export const CONFIG_i18n_LANGUAGES = [
  { lang: "vi", label: "Tiếng Việt", description: "Xin chào Chín Biên Niên Sử👋", png: "https://flagcdn.com/w320/vn.png", uiConfig: viVN, uiConfigDate: dateViVN },
  { lang: "en", label: "English", description: "Hello Nine Chronicles👋", png: "https://flagcdn.com/w320/us.png", uiConfig: enUS, uiConfigDate: dateEnUS }
] 