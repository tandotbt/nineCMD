import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'
import { computed, ref, watch, reactive } from 'vue'
import { useConfigURLStore } from './configURL'
import { useWebSocketBlockStore } from './webSocketBlock'
import { useArenaSeasonStore } from './arenaSeason'
import {
  COST_AP_BY_STAKE,
  COST_AP_BY_STAKE_MIN,
  TIMEOUT_USE_NODE,
  WAIT_CHECK_TX,
  LOCALE_ITEM_NAME_SHEET,
  URL_API_MIMIR
} from '@/utilities/constants'
import { useTimeoutPoll } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { combatPotion, statAndSkillOption } from '@/utilities/gearCombatPotion'
export const useFetchDataUser9CStore = defineStore('fetchDataUser9CStore', () => {
  const { locale } = useI18n()
  const useConfigURL = useConfigURLStore()
  const useWebSocketBlock = useWebSocketBlockStore()
  const useArenaSeason = useArenaSeasonStore()
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
  const mimir_arena_graphql = computed(() => `${URL_API_MIMIR}/${useWebSocketBlock.selectedPlanet.toLowerCase()}/graphql`)
  // const nodeChoosed_arena = computed(() => useConfigURL.selectedNode_arena)


  const isUseFetchArena = ref(true)
  const queryFetchArena = computed(() => {
    if (isUseFetchArena.value) {
      return `arenaInformation(championshipId: ${useArenaSeason.champIdActive}, round: ${useArenaSeason.roundIdActive}, avatarAddresses: ["${avatarAddress.value}"]){
        avatarAddress
        win
        lose
        ticket
        ticketResetCount
        purchasedTicketCount
      }`
    } else { return '' }
  })
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
            # arenaParticipants(
            #   avatarAddress: "${avatarAddress.value}"
            #   filterBounds: true
            # ) {
            #   avatarAddr
            #   score
            #   rank
            #   winScore
            #   loseScore
            #   cp
            #   portraitId
            #   level
            #   nameWithHash
            # }
            ${queryFetchArena.value}
          }
        }`
    }
  })
  // Data post riêng cho arena
  const postDataJson_arena = computed(() => {
    // return {
    //   query: `
    //     query {
    //       stateQuery {
    //         arenaParticipants(
    //           avatarAddress: "${avatarAddress.value}"
    //           filterBounds: true
    //         ) {
    //           avatarAddr
    //           score
    //           rank
    //           winScore
    //           loseScore
    //           cp
    //           portraitId
    //           level
    //           nameWithHash
    //         }
    //       }
    //     }`
    // }
    return {
      query: `
        query {
          arena {
            leaderboardByAvatarAddress(avatarAddress: "${avatarAddress.value}") {
              rank
              simpleAvatar {
                agentAddress
                level
                name
              }
              arenaScore {
                score
              }
              arenaInformation {
                lose
                purchasedTicketCount
                ticket
                ticketResetCount
                win
              }
              address
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
  // Hàm điền thêm thông tin
  const funcFillMoreInfo = {
    equipment: (data) => {
      if (!data) return []
      const result = []
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        item.indexKey = i;
        const name = useConfigURL.dataItemNameSheet[`ITEM_NAME_${item.id}`] ? useConfigURL.dataItemNameSheet[`ITEM_NAME_${item.id}`][LOCALE_ITEM_NAME_SHEET[locale.value]] : 'unknows'

        result.push({
          ...item,
          title: name,
          name,
          cp: combatPotion({
            hP: item.statsMap.hP,
            aTK: item.statsMap.aTK,
            dEF: item.statsMap.dEF,
            cRI: item.statsMap.cRI,
            hIT: item.statsMap.hIT,
            sPD: item.statsMap.sPD,
            hasSkill: item.skills.length !== 0 ? true : false
          }),
          skills: item.skills.map(skill => ({
            ...skill,
            name: useConfigURL.dataSkillNameSheet[`SKILL_NAME_${skill.id}`] ? useConfigURL.dataSkillNameSheet[`SKILL_NAME_${skill.id}`][LOCALE_ITEM_NAME_SHEET[locale.value]] : 'unknows',
            dataStat: useConfigURL.dataSkillSheet[skill.id] ? useConfigURL.dataSkillSheet[skill.id] : []
          })),
          statArray: statAndSkillOption({ stat: item.stat, skills: item.skills, statsMap: item.statsMap }),
          levelReq: useConfigURL.dataItemRequirementSheet[item.id] ? useConfigURL.dataItemRequirementSheet[item.id]['level'] : 888888
        })
      }
      return result
    },
    costumes: (data) => {
      if (!data) return []
      const result = []
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        item.indexKey = i;
        const name = useConfigURL.dataItemNameSheet[`ITEM_NAME_${item.id}`] ? useConfigURL.dataItemNameSheet[`ITEM_NAME_${item.id}`][LOCALE_ITEM_NAME_SHEET[locale.value]] : 'unknows'
        let statsMap = { HP: 0, ATK: 0, DEF: 0, CRI: 0, HIT: 0, SPD: 0 }
        for (const [key, value] of Object.entries(useConfigURL.dataCostumeStatSheet)) {
          if (value['costume_id'] === item.id) {
            statsMap[value['stat_type']] = value['stat']
          }
        }
        result.push({
          ...item,
          title: name,
          name,
          statsMap,
          cp: combatPotion({
            hP: statsMap.HP,
            aTK: statsMap.ATK,
            dEF: statsMap.DEF,
            cRI: statsMap.CRI,
            hIT: statsMap.HIT,
            sPD: statsMap.SPD,
            hasSkill: false
          }),
          statArray: statAndSkillOption({ stat: { statType: 'hP', totalValue: 0 }, skills: [], statsMap }),
          levelReq: useConfigURL.dataItemRequirementSheet[item.id] ? useConfigURL.dataItemRequirementSheet[item.id]['level'] : 888888
        })
      }
      return result
    },
    materials: (data) => {
      if (!data) return []
      const result = []
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        item.indexKey = i;
        let name = useConfigURL.dataItemNameSheet[`ITEM_NAME_${item.id}`] ? useConfigURL.dataItemNameSheet[`ITEM_NAME_${item.id}`][LOCALE_ITEM_NAME_SHEET[locale.value]] : 'error'
        result.push({
          ...item,
          title: name,
          name,
          statArray: []
        })
      }
      return result
    },
    consumables: (data) => {
      const result = data.reduce((acc, item) => {
        const itemId = item.id;
        const name = useConfigURL.dataItemNameSheet[`ITEM_NAME_${item.id}`] ? useConfigURL.dataItemNameSheet[`ITEM_NAME_${item.id}`][LOCALE_ITEM_NAME_SHEET[locale.value]] : 'error'
        const itemRequirement = useConfigURL.dataItemRequirementSheet[item.id] ? useConfigURL.dataItemRequirementSheet[item.id]['level'] : 888888
        const rawStatData = useConfigURL.dataConsumableItemSheet[item.id] ? useConfigURL.dataConsumableItemSheet[item.id] : {}

        const statsMap = { HP: 0, ATK: 0, DEF: 0, CRI: 0, HIT: 0, SPD: 0 }
        const statArray = []
        if (rawStatData['stat_type_1']) {
          statsMap[rawStatData['stat_type_1']] = rawStatData['stat_value_1']
          statArray.push('stat')
        }
        if (rawStatData['stat_type_2']) {
          statsMap[rawStatData['stat_type_2']] = rawStatData['stat_value_2']
          statArray.push('stat')
        }
        const accItem = acc.find(item => item.id === itemId);
        if (accItem) {
          accItem.itemIdList.push(item.itemId);
          accItem.count++;
        } else {
          acc.push({
            ...item,
            title: name,
            name,
            statsMap,
            cp: combatPotion({
              hP: statsMap.HP,
              aTK: statsMap.ATK,
              dEF: statsMap.DEF,
              cRI: statsMap.CRI,
              hIT: statsMap.HIT,
              sPD: statsMap.SPD,
              hasSkill: false
            }),
            statArray,
            itemIdList: [item.itemId],
            count: 1,
            levelReq: itemRequirement,
          });
        }
        return acc;
      }, []);
      return result.map((item, index) => ({ ...item, indexKey: index }));
    }
  }

  // Biến lưu web9csan = planet trước
  const web9csanBefore = ref(null)

  const useApi = (url, useNodeArena, postData) => {
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
            'Content-Type': 'application/json',
          }
          return options
        },
        // Lọc ra những dữ liệu cần

        afterFetch(ctx) {
          if (ctx.data.errors) {
            let isErrorFetchArena = false
            ctx.data.errors.forEach((error) => {
              console.log(error.message)
              if (error.message.includes('arenaInformation')) isErrorFetchArena = true
            })
            if (isErrorFetchArena) {
              isUseFetchArena.value = false
            }
            ctx.data = null
          } else {

            if (useNodeArena) {
              let leaderboardByAvatarAddress = ctx.data.data.arena.leaderboardByAvatarAddress || []
              // let participantArena = arenaParticipants.find(
              //   (participant) => participant.avatarAddr.toLowerCase() === avatarAddress.value.toLowerCase()
              // ) || []
              // let portraitId = participantArena ? participantArena.portraitId : 0
              let my_score = 0

              // Tìm score của avatar đặc biệt
              const myAvatar = leaderboardByAvatarAddress.find(item => item.address.toLowerCase() === avatarAddress.value.toLowerCase)
              if (myAvatar) {
                my_score = myAvatar.arenaScore.score
              }
              let arenaParticipants = leaderboardByAvatarAddress.map(item => {
                const avatarAddress = item.address
                const hashedPart = avatarAddress.slice(2, 6)
                const nameWithHash = `${item.simpleAvatar.name} <size=80%><color=#A68F7E>#${hashedPart}</color></size>`
                // Tính winScore
                let winScore = 0
                const score = item.arenaScore.score

                if (score >= my_score) {
                  winScore = 20
                } else if (score > my_score - 100) {
                  winScore = 18
                } else {
                  winScore = 16
                }
                return {
                  avatarAddr: avatarAddress,
                  score: item.arenaScore.score,
                  rank: item.rank,
                  winScore: winScore,
                  loseScore: -1,
                  cp: 1,
                  portraitId: 10200000,
                  level: item.simpleAvatar.level,
                  nameWithHash
                };
              });
              let portraitId = 10200000
              ctx.data = reactive({
                arenaParticipants,
                portraitId
              })
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
              let equipments = ctx.data.data.stateQuery.avatar.inventory.equipped
              let armorEquip = equipments.find((equip) => equip.itemSubType === 'ARMOR')
              let armorId = armorEquip ? armorEquip.id : 10200000
              let arenaInformation = ctx.data.data.stateQuery.arenaInformation || []
              let arenaInfo = arenaInformation.find(
                (adventure) => adventure.avatarAddress.toLowerCase() === avatarAddress.value.toLowerCase()
              ) || []
              let funcListEquipment = funcFillMoreInfo['equipment']
              let funcListMaterials = funcFillMoreInfo['materials']
              let funcListCostumes = funcFillMoreInfo['costumes']
              let funcListConsumables = funcFillMoreInfo['consumables']
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
                armorId,
                arenaInfo,
                listEquipment: funcListEquipment(ctx.data.data.stateQuery.avatar.inventory.all),
                listMaterials: funcListMaterials(ctx.data.data.stateQuery.avatar.inventory.materials),
                listCostumes: funcListCostumes(ctx.data.data.stateQuery.avatar.inventory.costumes),
                listConsumables: funcListConsumables(ctx.data.data.stateQuery.avatar.inventory.consumables),
              })
              ctx.data = defaultResponse
            }
          }
          return ctx
        }
      }
    )
      .json()
      .post(postData)
  }
  const {
    data: dataUser9C_normal,
    error: errorDataUser9C_normal,
    isFetching: isFetchingDataUser9CMain_normal,
    execute: executeUser9C_normal
  } = useApi(nodeChoosed, false, postDataJson)

  const {
    data: dataUser9C_arena,
    error: errorDataUser9C_arena,
    isFetching: isFetchingDataUser9CMain_arena,
    execute: executeUser9C_arena
  } = useApi(mimir_arena_graphql, true, postDataJson_arena)
  async function executeUser9C() {
    executeUser9C_normal()
    executeUser9C_arena()
  }
  // Ngăn login khi block vẫn 0 để có thể nhận champId và roundId chuẩn
  const isFetchingDataUser9C = computed(() => isFetchingDataUser9CMain_normal.value || isFetchingDataUser9CMain_arena.value || useWebSocketBlock.calculateAVG.blockNow === 0)
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
      // đồng thời đặt lại isUseFetchArena = true
      isUseFetchArena.value = true
      await new Promise((resolve) => setTimeout(resolve, TIMEOUT_USE_NODE * 1000))
    }
  }

  const { resume } = useTimeoutPoll(fetchData, WAIT_CHECK_TX)
  const ticketArenaBuy = ref(-1)
  return {
    nodeChoosed,
    agentAddress, avatarAddress, urlYourServer,
    dataUser9C_normal, errorDataUser9C_normal,
    dataUser9C_arena, errorDataUser9C_arena,
    isFetchingDataUser9C,
    executeUser9C, ticketArenaBuy,
    postDataJson,
    dataCheckTX, TXprevious,
    userAgent, userAvatar, userPassword, serverUrl, serverUsername, serverPassword,
    // Xử lý arena khi isUseFetchArena = false, dùng để xác định cần tạo action join_arena
    isUseFetchArena
  }
})
