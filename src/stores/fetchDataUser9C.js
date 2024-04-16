import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'
import { computed, ref, watch, reactive } from 'vue'
import { useConfigURLStore } from './configURL'
import {
  COST_AP_BY_STAKE,
  COST_AP_BY_STAKE_MIN,
  TIMEOUT_USE_NODE,
  WAIT_CHECK_TX
} from '@/utilities/constants'
import { useTimeoutPoll } from '@vueuse/core'

export const useFetchDataUser9CStore = defineStore('fetchDataUser9CStore', () => {
  const useConfigURL = useConfigURLStore()

  // const formDataUser9C = ref({
  //     user: {
  //         agentAddress: '',
  //         avatarAddress: '',
  //         password: ''
  //     },
  //     server: {
  //         url: '',
  //         username: '',
  //         password: ''
  //     }
  // })
  const userAgent = ref('')
  const userAvatar = ref('')
  const userPassword = ref('')
  const serverUrl = ref('')
  const serverUsername = ref('')
  const serverPassword = ref('')

  const agentAddress = computed(() => (userAgent.value !== null ? userAgent.value.trim() : null))
  const avatarAddress = computed(() => (userAvatar.value !== null ? userAvatar.value.trim() : null))
  const urlYourServer = computed(() =>
    serverUrl.value == null || serverUrl.value == ''
      ? 'https://ninecmd.pythonanywhere.com'
      : `https://${serverUrl.value}.pythonanywhere.com`
  )
  const nodeChoosed = computed(() => useConfigURL.selectedNode)
  const postDataJson = computed(() => {
    return {
      query: `
        query {
          stateQuery {
            stakeStates(addresses: "${agentAddress.value}") {
              deposit
            }
            agent(address: "${agentAddress.value}") {
              gold
              crystal
            }
            avatar(avatarAddress: "${avatarAddress.value}") {
              address
              actionPoint
              level
              dailyRewardReceivedIndex
              name
              stageMap {
                pairs
                count
              }
              runes {
                runeId
                level
              }
              inventory {
                consumables {
                  grade
                  id
                  itemType
                  itemSubType
                  elementalType
                  requiredBlockIndex
                  itemId
                  mainStat
                }
                materials {
                  grade
                  id
                  itemType
                  itemSubType
                  elementalType
                  requiredBlockIndex
                  itemId
                }
                costumes {
                  grade
                  id
                  itemType
                  itemSubType
                  elementalType
                  requiredBlockIndex
                  itemId
                  equipped
                }
                equipped: equipments(equipped:true){
                  itemSubType
                  id
                }
                all: equipments {
                  grade
                  id
                  itemType
                  itemSubType
                  elementalType
                  requiredBlockIndex
                  setId
                  stat {
                    statType
                    baseValue
                    totalValue
                    additionalValue
                  }
                  equipped
                  itemId
                  level
                  # exp đồ w8 to quá lỗi méo get data được :vvv
                  # exp
                  skills {
                    id
                    elementalType
                    power
                    chance
                    statPowerRatio
                    referencedStatType
                  }
                  buffSkills {
                    id
                    elementalType
                    power
                    chance
                    statPowerRatio
                    referencedStatType
                  }
                  statsMap {
                    hP
                    aTK
                    dEF
                    cRI
                    hIT
                    sPD
                  }
                }
              }
              itemMap {
                count
                pairs
              }
            }
            arenaParticipants(
              avatarAddress: "${avatarAddress.value}"
              filterBounds: true
            ) {
              avatarAddr
              score
              rank
              winScore
              loseScore
              cp
              portraitId
              level
              nameWithHash
            }
          }
        }`
    }
  })
  /* eslint-disable no-unused-vars */
  watch(postDataJson, (newValue, oldValue) => {
    executeUser9C()
    resume()
  })

  // Biến lưu web9csan = planet trước
  const web9csanBefore = ref(null)
  const useApi = (url) => {
    return useFetch(
      url,
      { refetch: true },
      {
        beforeFetch({ options, cancel }) {
          // Kiểm tra xem có đổi planet ko
          // Chưa đổi lần nào
          if (web9csanBefore.value === null) web9csanBefore.value = useConfigURL.apiRest9cscan
          // Nếu 2 planet trước và sau khác nhau thì hủy fetch, và lưu before mới để sau cho qua
          if (web9csanBefore.value !== useConfigURL.apiRest9cscan) {
            web9csanBefore.value = useConfigURL.apiRest9cscan
            cancel()
          }
          // Kiểm tra điều kiện của agent và avatar để fetch hay ko
          const regex = /^0x[a-zA-Z0-9]+$/
          if (!regex.test(agentAddress.value) || !regex.test(avatarAddress.value)) {
            cancel()
          }
          if (agentAddress.value.length !== 42 || avatarAddress.value.length !== 42) {
            cancel()
          }
          options.headers = {
            ...options.headers,
            'Content-Type': 'application/json'
          }
          return options
        },
        // Lọc ra những dữ liệu cần

        afterFetch(ctx) {
          if (ctx.data.errors) {
            ctx.data.errors.forEach((error) => {
              console.log(error.message)
            })
            ctx.data = null
          } else {
            let stakeNCG = parseFloat(
              ctx.data.data.stateQuery.stakeStates[0]
                ? ctx.data.data.stateQuery.stakeStates[0].deposit
                : 0
            )
            let costAPNow = COST_AP_BY_STAKE_MIN // Giả sử stake lớn hơn 500.000 ncg
            for (let i = 0; i < COST_AP_BY_STAKE.length; i++) {
              const { ncgStake, costAP } = COST_AP_BY_STAKE[i]
              if (stakeNCG < ncgStake) {
                costAPNow = costAP
                break // Kết thúc vòng lặp nếu tìm thấy mốc ncgStake phù hợp
              }
            }
            let arenaParticipants = ctx.data.data.stateQuery.arenaParticipants
            let participantArena = arenaParticipants.find(
              (participant) => participant.avatarAddr === avatarAddress.value
            )
            let equipments = ctx.data.data.stateQuery.avatar.inventory.equipped
            let armorEquip = equipments.find((equip) => equip.itemSubType === 'ARMOR')
            let armorId = armorEquip ? armorEquip.id : 10200000
            let portraitId = participantArena ? participantArena.portraitId : armorId
            const defaultResponse = reactive({
              crystal: parseFloat(parseFloat(ctx.data.data.stateQuery.agent.crystal).toFixed(2)),
              ncg: parseFloat(parseFloat(ctx.data.data.stateQuery.agent.gold).toFixed(2)),
              AP: ctx.data.data.stateQuery.avatar.actionPoint,
              blockRefillAP: ctx.data.data.stateQuery.avatar.dailyRewardReceivedIndex,
              inventory: ctx.data.data.stateQuery.avatar.inventory,
              itemMap: ctx.data.data.stateQuery.avatar.itemMap.pairs,
              name: ctx.data.data.stateQuery.avatar.name,
              level: ctx.data.data.stateQuery.avatar.level,

              runes: ctx.data.data.stateQuery.avatar.runes,
              stage: ctx.data.data.stateQuery.avatar.stageMap.pairs.filter(
                (subArray) => !subArray[0].toString().startsWith('100000')
              ).length,
              stakeNCG,
              costAP: costAPNow,
              arenaParticipants,
              portraitId
            })
            ctx.data = defaultResponse
          }
          return ctx
        }
      }
    )
      .json()
      .post(postDataJson)
  }
  const {
    data: dataUser9C,
    error: errorDataUser9C,
    isFetching: isFetchingDataUser9C,
    execute: executeUser9C
  } = useApi(nodeChoosed)

  // Hàm check tx của agent, nếu có tx mới sẽ refetch
  const urlCheckTX = computed(
    () =>
      `${useConfigURL.apiRest9cscan}/accounts/${agentAddress.value}/transactions?page=&action=&before=&limit=1`
  )
  const useApiCheckTX = (url) => {
    return useFetch(
      url,
      { refetch: false, immediate: false },
      {
        beforeFetch({ options, cancel }) {
          // Kiểm tra điều kiện của agent và avatar để fetch hay ko
          const regex = /^0x[a-zA-Z0-9]+$/
          if (!regex.test(agentAddress.value) || !regex.test(avatarAddress.value)) {
            cancel()
          }
          if (agentAddress.value.length !== 42 || avatarAddress.value.length !== 42) {
            cancel()
          }
          options.headers = {
            ...options.headers,
            'Content-Type': 'application/json'
          }
          return options
        },
        // Lọc ra những dữ liệu cần

        afterFetch(ctx) {
          if (ctx.data.transactions) {
            ctx.data = ctx.data.transactions[0] !== null ? ctx.data.transactions[0].id : ''
            return ctx
          }
          ctx.data = ''
          return ctx
        }
      }
    )
      .json()
      .get()
  }
  const {
    data: dataCheckTX,
    error: errorDataCheckTX,
    isFetching: isFetchingDataCheckTX,
    execute: executeCheckTX
  } = useApiCheckTX(urlCheckTX)
  const TXprevious = ref(null)
  const agentPrevious = ref(null)
  async function fetchData() {
    await executeCheckTX()
    // Lưu lại TX và agent đầu tiên
    if (TXprevious.value === null) TXprevious.value = dataCheckTX.value
    if (agentPrevious.value === null) agentPrevious.value = agentAddress.value
    // Khi có TX khác TX cũ
    if (dataCheckTX.value !== TXprevious.value && TXprevious.value !== null) {
      // Nếu vẫn của 1 agent
      if (agentPrevious.value === agentAddress.value) await executeUser9C()
      // Lưu lại TX mới hoặc agent mới nếu có
      agentPrevious.value = agentAddress.value
      TXprevious.value = dataCheckTX.value
      await new Promise((resolve) => setTimeout(resolve, TIMEOUT_USE_NODE * 1000))
    }
  }

  const { resume } = useTimeoutPoll(fetchData, WAIT_CHECK_TX)
  return {
    nodeChoosed,
    agentAddress,
    avatarAddress,
    urlYourServer,
    dataUser9C,
    errorDataUser9C,
    isFetchingDataUser9C,
    executeUser9C,
    postDataJson,
    dataCheckTX,
    TXprevious,
    userAgent,
    userAvatar,
    userPassword,
    serverUrl,
    serverUsername,
    serverPassword
  }
})
