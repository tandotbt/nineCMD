<template>
  <n-input-group>
    <n-select
      v-if="!useFetchDataUser9C.avatarAddress"
      :style="{ width: '30%' }"
      v-model:value="addressTemp"
      filterable
      :placeholder="t('@--components--leadboardArena-vue.placeholder.addressTemp')"
      :options="dataArenaFinalCopy"
      value-field="avatarAddr"
      label-field="nameWithHash"
      clearable
      :clear-filter-after-select="false"
    >
    </n-select>
    <n-select
      :style="{ width: '30%' }"
      v-model:value="nameSearch"
      filterable
      :placeholder="t('@--components--leadboardArena-vue.placeholder.nameSearch')"
      :options="dataArenaFinal"
      value-field="avatarAddr"
      label-field="nameWithHash"
      clearable
      multiple
      :clear-filter-after-select="false"
      max-tag-count="responsive"
      v-model:show="showIconSearch"
    >
      <template #arrow>
        <transition name="slide-up">
          <n-icon :component="SearchIconActive" v-if="showIconSearch" />
          <n-icon :component="SeatchIcon" v-else />
        </transition>
      </template>
    </n-select>

    <n-select
      :style="{ width: '40%' }"
      v-model:value="guildSearch"
      filterable
      :placeholder="t('@--components--leadboardArena-vue.placeholder.guildSearch')"
      :options="filterColumnGuild"
      clearable
      multiple
      :clear-filter-after-select="false"
      max-tag-count="responsive"
      :render-label="renderLabelGuild"
      :render-tag="renderMultipleSelectTagGuild"
    />
    <n-button
      type="success"
      :loading="isFetchingDataUser9C || useArenaSeason.isMergeListArena"
      :disabled="isFetchingDataUser9C || useArenaSeason.isMergeListArena"
      ghost
      @click="filterLowestCP()"
      :style="{ width: '5%' }"
    >
      <template #icon>
        <n-icon><AutoPickAddress /></n-icon>
      </template>
    </n-button>
    <n-button
      type="info"
      :loading="isFetchingDataUser9C || useArenaSeason.isMergeListArena"
      :disabled="isFetchingDataUser9C || useArenaSeason.isMergeListArena"
      ghost
      @click="refreshArena()"
      :style="{ width: '5%' }"
    >
      <template #icon>
        <n-icon><RenewIcon /></n-icon>
      </template>
    </n-button>
    <n-button
      type="info"
      :loading="isFetchingDataUser9C || useArenaSeason.isMergeListArena"
      :disabled="isFetchingDataUser9C || useArenaSeason.isMergeListArena"
      ghost
      @click="filterAllGuild()"
      :style="{ width: '5%' }"
    >
      <template #icon>
        <n-icon><SelectALl /></n-icon>
      </template>
    </n-button>
    <n-button
      type="info"
      :loading="isFetchingDataUser9C || useArenaSeason.isMergeListArena"
      :disabled="isFetchingDataUser9C || useArenaSeason.isMergeListArena"
      ghost
      @click="savingSorterAndFilter()"
      :style="{ width: '5%' }"
    >
      <template #icon>
        <n-icon><SavingSorterAndFilterIcon /></n-icon>
      </template>
    </n-button>
    <n-button
      :loading="isFetchingDataUser9C || useArenaSeason.isMergeListArena"
      :disabled="isFetchingDataUser9C || useArenaSeason.isMergeListArena"
      ghost
      strong
      type="error"
      @click="clearAllSorterAndFilter()"
      :style="{ width: '5%' }"
    >
      <template #icon>
        <n-icon><ClearIcon /></n-icon>
      </template>
    </n-button>
    <n-button
      :loading="isFetchingDataUser9C || useArenaSeason.isMergeListArena"
      :disabled="isFetchingDataUser9C || useArenaSeason.isMergeListArena"
      ghost
      strong
      circle
      @click="scrollToMe()"
      :style="{ width: '5%' }"
    >
      <template #icon>
        <n-icon><SeatchIcon /></n-icon>
      </template>
    </n-button>
  </n-input-group>
  <n-data-table
    ref="dataTableInst"
    size="small"
    pagination-behavior-on-filter="current"
    :columns="columns"
    :data="dataArenaFinal"
    :pagination="paginationReactive"
    :max-height="maxHeight"
    :scroll-x="scrollXTable"
    striped
    :loading="isFetchingDataUser9C || useArenaSeason.isMergeListArena"
    @update:sorter="handleUpdateSorted"
  >
    <template #loading>
      <img :src="imgList.gifLoading" />
    </template>
  </n-data-table>
  <!-- <n-p>{{ props }}</n-p>
  <n-collapse>
    <n-collapse-item title="isFetchingDataUser9C" name="1">
      <pre>{{ isFetchingDataUser9C }}</pre>
      <pre>{{ useArenaSeason.seasonActiveNow }}</pre>
    </n-collapse-item>
    <n-collapse-item title="rawArena" name="2">
      <pre>{{ rawArena }}</pre>
    </n-collapse-item>
    <n-collapse-item title="dataArenaFinal" name="3">
      <pre>{{ dataArenaFinal }}</pre>
    </n-collapse-item>
    <n-collapse-item title="dataAfterSortAndFilter" name="4">
      <pre>{{ dataAfterSortAndFilter }}</pre>
    </n-collapse-item>
  </n-collapse> -->
</template>

<script setup>
// Define props
const props = defineProps({
  isActive: Boolean,
  champIdSelect: Number,
  roundIdSelect: Number
})

import { useI18n } from 'vue-i18n'
import { ref, reactive, computed, watch, h, createVNode, onMounted, onBeforeUnmount } from 'vue'
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'
import { useArenaSeasonStore } from '@/stores/arenaSeason'
import { useConfigURLStore } from '@/stores/configURL'
import headerAvatar from '@/components/other/headerAvatar.vue'
import guildImg from '@/components/other/guildImg.vue'
import { NButton, NFlex, NIcon, NText, NAvatar, NTag } from 'naive-ui'
import {
  SaveRound as SavingSorterAndFilterIcon,
  SearchRound as SeatchIcon,
  DensitySmallRound as SelectALl,
  ClearAllRound as ClearIcon,
  AutoAwesomeRound as AutoPickAddress,
  ManageSearchRound as SearchIconActive,
  AutorenewRound as RenewIcon
} from '@vicons/material'
import { getImageBase64FromCacheOrFetch } from '@/utilities/getImageBase64FromCacheOrFetch'
import { convertToArenaParticipants } from '@/utilities/convertToArenaParticipants'
import mergeListArena from '@/utilities/mergeListArena'
import { useSorted, useArrayFilter, useStorage, watchDebounced, useFetch } from '@vueuse/core'

const { t, n } = useI18n()
const useConfigURL = useConfigURLStore()
const useFetchDataUser9C = useFetchDataUser9CStore()
const useArenaSeason = useArenaSeasonStore()
// Các nút nhấn
const dataTempNineCMD = useStorage('nine-cmd-data-temp', {}, sessionStorage)
const maxHeight = 225
const scrollXTable = 1900
const isFetchingDataUser9C = computed(() => useFetchDataUser9C.isFetchingDataUser9C)
function addRankGuildToGuildLabels(listGuildLabel, listGuildScore) {
  // Sửa lỗi chưa kịp lưu listGuildScore vào bộ nhớ mà đã lấy dùng
  if (!listGuildScore) return listGuildLabel
  return listGuildLabel.map((obj1) => ({
    ...obj1,
    rankGuild: listGuildScore[obj1.value] ? listGuildScore[obj1.value].rankGuild : null
  }))
}
const filterColumnGuild = computed(() =>
  dataTempNineCMD.value['listGuildLabel'] !== undefined
    ? addRankGuildToGuildLabels(
        dataTempNineCMD.value['listGuildLabel'],
        dataTempNineCMD.value['listGuildScore']
      )
    : []
)
import { useHandlerCreatNewActionStore } from '@/stores/handlerCreatNewAction'
const useHandlerCreatNewAction = useHandlerCreatNewActionStore()
// Hàm thử attack arena
function tryAttack(row) {
  const dataInput = {
    avatarAddressEnemy: row.avatarAddr,
    ticket: 1,
    equipments: [],
    costumes: [],
    runeInfos: [],
    auras: [],
    isLimit: true
  }
  useHandlerCreatNewAction.handleActionNew('battleArena', dataInput)
}
import { URL_API_9CAPI, API_URL_MERGE_ARENA, URL_API_MIMIR } from '@/utilities/constants.js'
const urlCheckWinRate = computed(
  () =>
    `${URL_API_9CAPI}/arenaSim${useConfigURL.selectedPlanet.charAt(0).toUpperCase() + useConfigURL.selectedPlanet.slice(1)}`
)
const postCheckWinRate = reactive({
  avatarAddress: '',
  enemyAddress: ''
})
const {
  data: dataCheckWinRate,
  execute: executeCheckWinRate,
  abort: abortCheckWinRate
} = useFetch(
  urlCheckWinRate,
  { immediate: false },
  {
    beforeFetch({ options }) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json'
      }
      return options
    },
    afterFetch(ctx) {
      if (
        (ctx.data.winPercentage === undefined || ctx.data.winPercentage === null) &&
        ctx.data.winPercentage !== 0
      ) {
        console.log('Lỗi CheckWinRate')
        console.error(ctx.data)
        ctx.data = -1
        return ctx
      }
      ctx.data = ctx.data.winPercentage ? ctx.data.winPercentage / 100 : -1
      return ctx
    },
    updateDataOnError: true,
    onFetchError(ctx) {
      console.log('Lỗi gì đó executeCheckWinRate')
      ctx.data = -1
      return ctx
    }
  }
)
  .json()
  .post(postCheckWinRate)

async function tryCheckWinRate(row) {
  useArenaSeason.isMergeListArena = true
  const myAvatarAddress = useFetchDataUser9C.avatarAddress
    ? useFetchDataUser9C.avatarAddress.toLowerCase()
    : addressTemp.value.toLowerCase()
  const enemyAvatarAddress = row.avatarAddr.toLowerCase()
  postCheckWinRate.avatarAddress = myAvatarAddress
  postCheckWinRate.enemyAddress = enemyAvatarAddress
  const indexMyAvatar = dataArenaFinal.value.findIndex(
    (item) => item.avatarAddr.toLowerCase() === myAvatarAddress
  )

  const indexEnemyAvatar = dataArenaFinal.value.findIndex(
    (item) => item.avatarAddr.toLowerCase() === enemyAvatarAddress
  )

  const CPMy = dataArenaFinal.value[indexMyAvatar].cp
  const CPEnemy = dataArenaFinal.value[indexEnemyAvatar].cp

  await executeCheckWinRate()

  const winRate = dataCheckWinRate.value // Lấy giá trị winRate sau khi kiểm tra

  // Thêm khóa mới cho dataTempNineCMD.value[`${useConfigURL.selectedPlanet}_${CPMy}_${myAvatarAddress}`]
  if (!dataTempNineCMD.value[`${useConfigURL.selectedPlanet}_${CPMy}_${myAvatarAddress}`]) {
    dataTempNineCMD.value[`${useConfigURL.selectedPlanet}_${CPMy}_${myAvatarAddress}`] = {}
  }
  dataTempNineCMD.value[`${useConfigURL.selectedPlanet}_${CPMy}_${myAvatarAddress}`][
    enemyAvatarAddress
  ] = {
    cp: CPEnemy,
    winRate
  }

  reUseWinRate()

  useArenaSeason.isMergeListArena = false
}
// Sử dụng lại winRate đã lưu
function reUseWinRate() {
  const myAvatarAddressTemp = useFetchDataUser9C.avatarAddress
    ? useFetchDataUser9C.avatarAddress
    : addressTemp.value

  if (!myAvatarAddressTemp) return
  const myAvatarAddress = myAvatarAddressTemp.toLowerCase()
  const indexMyAvatar = dataArenaFinal.value.findIndex(
    (item) => item.avatarAddr.toLowerCase() === myAvatarAddress
  )
  if (indexMyAvatar === -1) return
  const CPMy = dataArenaFinal.value[indexMyAvatar].cp
  if (!dataTempNineCMD.value[`${useConfigURL.selectedPlanet}_${CPMy}_${myAvatarAddress}`]) {
    dataTempNineCMD.value[`${useConfigURL.selectedPlanet}_${CPMy}_${myAvatarAddress}`] = {}
  }

  const savedWinRate =
    dataTempNineCMD.value[`${useConfigURL.selectedPlanet}_${CPMy}_${myAvatarAddress}`]
  for (const key in savedWinRate) {
    const tempKey = savedWinRate[key]
    const indexArenaFinal = dataArenaFinal.value.findIndex(
      (enemy) => enemy.avatarAddr.toLowerCase() === key.toLowerCase()
    )

    if (indexArenaFinal !== -1 && tempKey.cp === dataArenaFinal.value[indexArenaFinal].cp) {
      dataArenaFinal.value[indexArenaFinal].winRate = tempKey.winRate
    }

    const indexAfterSortAndFilter = dataAfterSortAndFilter.value.findIndex(
      (enemy) => enemy.avatarAddr.toLowerCase() === key.toLowerCase()
    )

    if (
      indexAfterSortAndFilter !== -1 &&
      tempKey.cp === dataAfterSortAndFilter.value[indexAfterSortAndFilter].cp
    ) {
      dataAfterSortAndFilter.value[indexAfterSortAndFilter].winRate = tempKey.winRate
    }
  }
}

function savingSorterAndFilter() {
  dataTempNineCMD.value['savingSorterAndFilter'] = {
    sorter: allSortedRef.value,
    filterName: allFiltersRef.avatarAddr ? allFiltersRef.avatarAddr : [],
    filterGuild: allFiltersRef.nameGuild ? allFiltersRef.nameGuild : []
  }
}

function useSavingSorterAndFilter() {
  // clearAllSorterAndFilter()
  if (dataTempNineCMD.value['savingSorterAndFilter'] !== undefined) {
    const savedSorted = dataTempNineCMD.value['savingSorterAndFilter'].sorter
      ? dataTempNineCMD.value['savingSorterAndFilter'].sorter
      : []
    for (const { columnKey, order } of savedSorted) {
      dataTableInst.value.sort(columnKey, order)
    }
    guildSearch.value = dataTempNineCMD.value['savingSorterAndFilter'].filterGuild
      ? dataTempNineCMD.value['savingSorterAndFilter'].filterGuild
      : []
    nameSearch.value = dataTempNineCMD.value['savingSorterAndFilter'].filterName
      ? dataTempNineCMD.value['savingSorterAndFilter'].filterName
      : []
  }
  filterDataAfter(allFiltersRef)
  reUseWinRate()
  scrollToMe()
}
function clearAllSorterAndFilter() {
  nameSearch.value = []
  guildSearch.value = []
  dataTableInst.value.sort(null)
  dataTableInst.value.filter(null)
}
function refreshArena() {
  if (
    !isFetchingDataUser9C.value &&
    props.isActive == true &&
    props.champIdSelect != 0 &&
    props.roundIdSelect != 0
  )
    useFetchDataUser9C.executeUser9C()
}
// Tìm vị trí của addressFind trong mảng data
const addressTemp = ref(null)
const findIndex = computed(() => {
  return useFetchDataUser9C.avatarAddress || addressTemp.value === null
    ? dataAfterSortAndFilter.value.findIndex(
        (item) => item.avatarAddr.toLowerCase() === useFetchDataUser9C.avatarAddress.toLowerCase()
      )
    : dataAfterSortAndFilter.value.findIndex((item) => item.avatarAddr === addressTemp.value)
})
const findPageIndex = computed(() => {
  return Math.ceil((findIndex.value + 1) / paginationReactive.pageSize)
})
const scrollToPosition = (scrollContainer, positionPercentage) => {
  if (scrollContainer.value) {
    // const scrollTo = maxHeight * positionPercentage // Tính vị trí cần cuộn tới
    const scrollTo = positionPercentage * 75
    // Cuộn đến vị trí cần tới với hiệu ứng mềm mại
    scrollContainer.value.scrollTo({
      top: scrollTo,
      behavior: 'smooth'
    })
  }
}
function scrollToMe() {
  // Cập nhật giá trị trước khi cuộn
  paginationReactive.onChange(findPageIndex.value)
  useFetchDataUser9C.ticketArenaBuy =
    dataArenaFinal.value[findPageIndex.value] !== undefined
      ? dataArenaFinal.value[findPageIndex.value].ticketBuy
      : -1
  setTimeout(() => {
    // Tính lại phần trăm vị trí trong trang
    // let positionPercentage =
    //   (paginationReactive.pageSize -
    //     (findPageIndex.value * paginationReactive.pageSize - (findIndex.value + 1))) /
    //   paginationReactive.pageSize

    let positionPercentage =
      paginationReactive.pageSize -
      (findPageIndex.value * paginationReactive.pageSize - findIndex.value)
    // Cuộn đến vị trí cần tới
    scrollToPosition(dataTableInst, positionPercentage)
  }, 1200)
}
// Ảnh
const imgList = ref({
  gifLoading: getImageBase64FromCacheOrFetch('/assets/gifs/loading_blocks.gif'),
  score: getImageBase64FromCacheOrFetch('/assets/iconsArena/Arena_bg_19.png'),
  ncg: getImageBase64FromCacheOrFetch('/assets/icons/NCG.png'),
  ncgNextBuy: getImageBase64FromCacheOrFetch('/assets/icons/NCG_PRICE_NEXT_TICKET_ARENA.png'),
  ncgTotalBought: getImageBase64FromCacheOrFetch('/assets/icons/NCG_TOTAL_SPEND_ARENA.png'),
  ncgStake: getImageBase64FromCacheOrFetch('/assets/icons/NCG_STAKE.png'),
  ticket: getImageBase64FromCacheOrFetch('/assets/icons/ARENA_TICKET.png'),
  ticketBuy: getImageBase64FromCacheOrFetch('/assets/icons/ARENA_TICKET_BUY.png'),
  ticketBought: getImageBase64FromCacheOrFetch('/assets/icons/ARENA_TICKET_BOUGHT.png'),
  scoreGuild: getImageBase64FromCacheOrFetch('/assets/iconsArena/GUILD_SCORE.png'),
  scoreGuildDiff: getImageBase64FromCacheOrFetch('/assets/iconsArena/GUILD_SCORE_DIFF.png')
})
// Sort và filter
const dataAfterSortAndFilter = ref([])
// Khởi tạo một đối tượng reactive để theo dõi các bộ lọc
const allSortedRef = ref()
const allFiltersRef = reactive({
  avatarAddr: null,
  nameGuild: null
})
const nameSearch = ref()
const showIconSearch = ref(false)
const guildSearch = ref()
function filterAllGuild() {
  guildSearch.value = filterColumnGuild.value.map((item) => item.value)
}
function filterLowestCP() {
  const filteredData = {}

  // Tạo nhóm dữ liệu dựa trên key winScore
  dataArenaFinal.value.forEach((item) => {
    const winScore = item.winScore.toString()
    if (!filteredData[winScore]) {
      filteredData[winScore] = []
    }
    filteredData[winScore].push(item)
  })

  // Lọc ra tối đa 5 người có CP thấp nhất trong từng nhóm
  for (const key in filteredData) {
    if (Object.prototype.hasOwnProperty.call(filteredData, key)) {
      filteredData[key] = filteredData[key].sort((a, b) => a.cp - b.cp).slice(0, 5)
    }
  }

  const addressArray = Object.values(filteredData).flatMap((group) =>
    group.map((item) => item.avatarAddr)
  )
  nameSearch.value = addressArray.concat(
    useFetchDataUser9C.dataUser9C_normal
      ? useFetchDataUser9C.dataUser9C_normal.arenaInfo.avatarAddress
      : null
  )
}

function sortDataAfter(options) {
  // Lưu lại bộ lọc đã lọc
  allSortedRef.value = options
  const listSorted = options !== undefined && options !== null ? options : []
  const filteredObjects = listSorted.filter((obj) => obj.order !== false)
  // Sắp xếp filteredObjects theo độ ưu tiên từ cao đến thấp
  filteredObjects.sort((a, b) => {
    if (a.sorter.multiple === b.sorter.multiple) {
      return 0
    }
    return a.sorter.multiple < b.sorter.multiple ? -1 : 1
  })

  // Lọc dataRaw theo thứ tự ưu tiên
  let sortResults = [...dataAfterSortAndFilter.value] // Mảng chứa kết quả sắp xếp tạm thời
  for (let i = 0; i < filteredObjects.length; i++) {
    let option = filteredObjects[i]
    // Xác định hướng sắp xếp
    let direction = 1 // Mặc định là sắp xếp tăng dần
    if (option.order === 'descend') {
      direction = -1 // Đặt lại hướng sắp xếp thành giảm dần nếu được chỉ định
    }
    // Sắp xếp và lưu kết quả vào mảng sortResults
    useSorted(
      sortResults,
      (a, b) => {
        // Sử dụng biến direction để xác định hướng sắp xếp
        return direction * option.sorter.compare(a, b)
      },
      { dirty: true }
    )
  }
  dataAfterSortAndFilter.value = sortResults
}
function handleUpdateSorted(options) {
  // Filter trước
  filterDataAfter(allFiltersRef)
  sortDataAfter(options)
}
watchDebounced(
  nameSearch,
  () => {
    const checkLengthNameSearch = nameSearch.value ? nameSearch.value.length : 0
    if (checkLengthNameSearch > 0) {
      dataTableInst.value.filter({
        nameWithHash: nameSearch.value,
        nameGuild: allFiltersRef.nameGuild
      })
      allFiltersRef.avatarAddr = nameSearch.value
    } else {
      dataTableInst.value.filter({
        nameWithHash: null,
        nameGuild: guildSearch.value
      })
      allFiltersRef.avatarAddr = null
    }
  },
  { debounce: 1000, maxWait: 2000 }
)

watchDebounced(
  guildSearch,
  () => {
    const checkLengthGuildSearch = guildSearch.value ? guildSearch.value.length : 0
    if (checkLengthGuildSearch > 0) {
      dataTableInst.value.filter({
        nameWithHash: allFiltersRef.avatarAddr,
        nameGuild: guildSearch.value
      })
      allFiltersRef.nameGuild = guildSearch.value
    } else {
      dataTableInst.value.filter({
        nameWithHash: allFiltersRef.avatarAddr,
        nameGuild: null
      })
      allFiltersRef.nameGuild = null
    }
  },
  { debounce: 1000, maxWait: 2000 }
)
// Hiển thị tìm kiếm guild
const renderLabelGuild = (option) => {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    },
    [
      h(NAvatar, {
        src: `https://guild.nine-chronicles.com/${option.img}.png`,
        round: true,
        size: 'small'
      }),
      h(
        'div',
        {
          style: {
            marginLeft: '12px',
            padding: '4px 0'
          }
        },
        [
          h('div', null, [option.label]),
          h(
            NText,
            { depth: 3, tag: 'div' },
            {
              default: () => `#${option.rankGuild}`
            }
          )
        ]
      )
    ]
  )
}
const renderMultipleSelectTagGuild = ({ option, handleClose }) => {
  return h(
    NTag,
    {
      style: {
        padding: '0 6px 0 4px'
      },
      round: true,
      closable: true,
      onClose: (e) => {
        e.stopPropagation()
        handleClose()
      }
    },
    {
      default: () =>
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center'
            }
          },
          [
            h(NAvatar, {
              src: `https://guild.nine-chronicles.com/${option.img}.png`,
              round: true,
              size: 22,
              style: {
                marginRight: '4px'
              }
            }),
            option.label
          ]
        )
    }
  )
}

function filterDataAfter(newVal) {
  let resultFilter = dataArenaFinal.value.slice() // Tạo một bản sao của dataArenaFinal để thực hiện filter

  // Duyệt qua mỗi cặp key-value trong allFiltersRef
  let checkNull = 0
  for (const [key, value] of Object.entries(newVal)) {
    if (value !== null) {
      // Kiểm tra xem mảng bộ lọc có phần tử không
      resultFilter = useArrayFilter(resultFilter, (item) =>
        value.some((filter) => item[key] && item[key].includes(filter))
      )
    } else checkNull += 1
  }
  // Nếu đã lọc 1 lần thì trả về dữ liệu đã lọc, ko thì về dữ liệu gốc
  if (checkNull !== 2) dataAfterSortAndFilter.value = resultFilter.value
  else dataAfterSortAndFilter.value = resultFilter
}
// Sử dụng watch để theo dõi sự thay đổi trong các bộ lọc và áp dụng chúng vào dữ liệu
// eslint-disable-next-line no-unused-vars
watch(allFiltersRef, (newVal, oldVal) => {
  filterDataAfter(newVal)
  // Sort lại
  sortDataAfter(allSortedRef.value)
})
// Bảng table
const renderNIconWithImage = (data, imgSrc) => {
  return createVNode(
    NFlex,
    { justify: 'left' },
    {
      default: () => [
        createVNode('span', null, n(data, 'NCG')),
        createVNode(
          NIcon,
          { size: '20' },
          {
            default: () =>
              createVNode('img', {
                src: getImageBase64FromCacheOrFetch(imgSrc),
                style: { width: '100%', height: '100%' }
              })
          }
        )
      ]
    }
  )
}

const renderNIconTitleColumns = (imgSrc) => {
  return createVNode(
    NIcon,
    { size: '24' },
    {
      default: () =>
        createVNode('img', {
          src: getImageBase64FromCacheOrFetch(imgSrc),
          style: { width: '100%', height: '100%' }
        })
    }
  )
}
const dataTableInst = ref(null)
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [5, 10, 20],
  pageSlot: 5,
  onChange: (page) => {
    paginationReactive.page = page
  },
  onUpdatePageSize: (pageSize) => {
    paginationReactive.pageSize = pageSize
    paginationReactive.page = 1
  }
})

const columns = reactive([
  {
    title() {
      return t('@--components--leadboardArena-vue.title.rank')
    },
    key: 'rank',
    fixed: 'left',
    width: 50,
    sorter: {
      compare: (a, b) => {
        return a.rank - b.rank
      },
      multiple: 18
    },
    render(row) {
      return row.rank || row.rank === 0
        ? h('span', `${row.rank}`)
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return t('@--components--leadboardArena-vue.title.level')
    },
    key: 'level',
    fixed: 'left',
    width: 100,
    sorter: {
      compare: (a, b) => {
        return a.level - b.level
      },
      multiple: 12
    },
    render(row) {
      return row.level && row.avatarAddr && row.portraitId && row.level
        ? h(headerAvatar, {
            avatarAddress: row.avatarAddr,
            portraitId: row.portraitId,
            level: row.level
          })
        : h(headerAvatar, {
            avatarAddress: ''
          })
    }
  },
  {
    title() {
      return t('@--components--leadboardArena-vue.title.nameGuild')
    },
    key: 'nameGuild',
    fixed: 'left',
    width: 80,

    filter(value, row) {
      return ~row.nameGuild.indexOf(value)
    },
    sorter: {
      compare: (a, b) => {
        return a.nameGuild.localeCompare(b.nameGuild)
      },
      multiple: 19
    },
    render(row) {
      return row.nameGuild || row.nameGuild === 0
        ? h(guildImg, {
            nameGuild: row.nameGuild,
            rankMember: row.rankMember,
            rankGuild: row.rankGuild,
            totalScoreGuild: row.totalScoreGuild
          })
        : h(guildImg, {
            nameGuild: ''
          })
    }
  },
  {
    title() {
      return t('@--components--leadboardArena-vue.title.nameWithHash')
    },
    key: 'nameWithHash',
    width: 120,
    fixed: 'left',
    ellipsis: {
      tooltip: true
    },
    sorter: {
      compare: (a, b) => {
        return a.nameWithHash.localeCompare(b.nameWithHash)
      },
      multiple: 11
    },
    filter(value, row) {
      return ~row.avatarAddr.indexOf(value)
    },
    render(row) {
      return row.nameWithHash || row.nameWithHash === 0
        ? h('span', {}, [
            row.nameWithHash.split('#')[0],
            h(NText, { depth: 3 }, { default: () => ' #' + row.nameWithHash.split('#')[1] })
          ])
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return t('@--components--leadboardArena-vue.title.cp')
    },
    key: 'cp',
    width: 130,
    defaultSortOrder: false,

    sorter: {
      compare: (a, b) => {
        return a.cp - b.cp
      },
      multiple: 8
    },
    render(row) {
      return row.cp || row.cp === 0
        ? h('span', n(row.cp, 'CombatPotion'))
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return renderNIconTitleColumns(imgList.value.score)
    },
    defaultSortOrder: false,
    width: 100,
    key: 'score',
    sorter: {
      compare: (a, b) => {
        return a.score - b.score
      },
      multiple: 9
    },
    render(row) {
      return row.score || row.score === 0
        ? h('span', n(row.score, 'ScoreArena'))
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return renderNIconTitleColumns(imgList.value.scoreGuild)
    },
    key: 'totalScoreGuild',
    width: 100,
    defaultSortOrder: false,

    sorter: {
      compare: (a, b) => {
        return a.totalScoreGuild - b.totalScoreGuild
      },
      multiple: 17
    },
    render(row) {
      return row.totalScoreGuild || row.totalScoreGuild === 0
        ? h('span', n(row.totalScoreGuild, 'ScoreArena'))
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return renderNIconTitleColumns(imgList.value.scoreGuildDiff)
    },
    key: 'totalScoreGuildDiff',
    width: 100,
    defaultSortOrder: false,
    sorter: {
      compare: (a, b) => {
        return a.totalScoreGuildDiff - b.totalScoreGuildDiff
      },
      multiple: 14
    },
    render(row) {
      return row.totalScoreGuildDiff || row.totalScoreGuildDiff === 0
        ? h('span', n(row.totalScoreGuildDiff, 'ScoreArena'))
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return t('@--components--leadboardArena-vue.title.totalCPGuild')
    },
    key: 'totalCPGuild',
    defaultSortOrder: false,
    width: 150,

    sorter: {
      compare: (a, b) => {
        return a.totalCPGuild - b.totalCPGuild
      },
      multiple: 15
    },
    render(row) {
      return row.totalCPGuild || row.totalCPGuild === 0
        ? h('span', n(row.totalCPGuild, 'CombatPotion'))
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return t('@--components--leadboardArena-vue.title.rankGuild')
    },
    key: 'rankGuild',
    defaultSortOrder: false,
    width: 150,
    sorter: {
      compare: (a, b) => {
        return a.rankGuild - b.rankGuild
      },
      multiple: 13
    },
    render(row) {
      return row.rankGuild || row.rankGuild === 0
        ? h('span', `${row.rankGuild}`)
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return t('@--components--leadboardArena-vue.title.rankMember')
    },
    key: 'rankMember',
    defaultSortOrder: false,
    width: 150,
    sorter: {
      compare: (a, b) => {
        return a.rankMember - b.rankMember
      },
      multiple: 16
    },
    render(row) {
      return row.rankMember || row.rankMember === 0
        ? h('span', `${row.rankMember}`)
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return t('@--components--leadboardArena-vue.title.win')
    },
    key: 'win',
    defaultSortOrder: false,
    width: 100,
    sorter: {
      compare: (a, b) => {
        return a.win - b.win
      },
      multiple: 7
    },
    render(row) {
      return row.win || row.win === 0
        ? h('span', `${row.win}`)
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return t('@--components--leadboardArena-vue.title.lose')
    },
    key: 'lose',
    defaultSortOrder: false,
    width: 100,
    sorter: {
      compare: (a, b) => {
        return a.lose - b.lose
      },
      multiple: 6
    },
    render(row) {
      return row.lose || row.lose === 0
        ? h('span', `${row.lose}`)
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return renderNIconTitleColumns(imgList.value.ticket)
    },
    defaultSortOrder: false,
    width: 70,
    key: 'ticket',
    sorter: {
      compare: (a, b) => {
        return a.ticket - b.ticket
      },
      multiple: 5
    },
    render(row) {
      return row.ticket || row.ticket === 0
        ? h('span', `${row.ticket}/8`)
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return renderNIconTitleColumns(imgList.value.ticketBuy)
    },
    defaultSortOrder: false,
    width: 70,
    key: 'ticketBuy',
    sorter: {
      compare: (a, b) => {
        return a.ticketBuy - b.ticketBuy
      },
      multiple: 4
    },
    render(row) {
      return row.ticketBuy || row.ticketBuy === 0
        ? h('span', `${row.ticketBuy}/${useArenaSeason.maxPurchaseCountDuringIntervalActive}`)
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return renderNIconTitleColumns(imgList.value.ticketBought)
    },
    defaultSortOrder: false,
    width: 70,
    key: 'purchasedTicketCount',
    sorter: {
      compare: (a, b) => {
        return a.purchasedTicketCount - b.purchasedTicketCount
      },
      multiple: 3
    },
    render(row) {
      return row.purchasedTicketCount || row.purchasedTicketCount === 0
        ? h('span', `${row.purchasedTicketCount}/${useArenaSeason.maxPurchaseCountActive}`)
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return renderNIconTitleColumns(imgList.value.ncgNextBuy)
    },
    defaultSortOrder: false,
    width: 120,
    key: 'nextPTNCG',
    sorter: {
      compare: (a, b) => {
        return a.nextPTNCG - b.nextPTNCG
      },
      multiple: 2
    },
    render(row) {
      return row.nextPTNCG || row.nextPTNCG === 0
        ? renderNIconWithImage(row.nextPTNCG, imgList.value.ncg)
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return renderNIconTitleColumns(imgList.value.ncgTotalBought)
    },
    defaultSortOrder: false,
    width: 120,
    key: 'purchasedTicketNCG',
    sorter: {
      compare: (a, b) => {
        return a.purchasedTicketNCG - b.purchasedTicketNCG
      },
      multiple: 1
    },
    render(row) {
      return row.purchasedTicketNCG || row.purchasedTicketNCG === 0
        ? renderNIconWithImage(row.purchasedTicketNCG, imgList.value.ncg)
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return renderNIconTitleColumns(imgList.value.ncgStake)
    },
    defaultSortOrder: false,
    width: 120,
    key: 'stake',
    sorter: {
      compare: (a, b) => {
        return a.stake - b.stake
      },
      multiple: 0
    },
    render(row) {
      return row.stake || row.stake === 0
        ? renderNIconWithImage(row.stake, imgList.value.ncgStake)
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return t('@--components--leadboardArena-vue.title.winScore')
    },
    key: 'winScore',

    // ellipsis: {
    //   tooltip: true
    // },
    // fixed: 'right',
    width: 120,
    defaultSortOrder: false,
    sorter: {
      compare: (a, b) => {
        return a.winScore - b.winScore
      },
      multiple: 10
    },
    // filterOptions: [
    //   {
    //     label: '+20',
    //     value: 20
    //   },
    //   {
    //     label: '+18',
    //     value: 18
    //   },
    //   {
    //     label: '+16',
    //     value: 16
    //   }
    // ],
    // filter(value, row) {
    //   // Chuyển đổi giá trị của "winScore" thành số nguyên
    //   const winScoreValue = parseInt(row.winScore, 0)
    //   // Kiểm tra xem giá trị "winScore" có lớn hơn hoặc bằng giá trị của bộ lọc không
    //   return winScoreValue == value
    // },
    render(row) {
      return row.winScore || row.winScore === 0
        ? h('span', `+${row.winScore}`)
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return t('@--components--leadboardArena-vue.title.winRate')
    },
    key: 'winRate',

    fixed: 'right',
    width: 100,
    defaultSortOrder: false,
    sorter: {
      compare: (a, b) => {
        return a.winRate - b.winRate
      },
      multiple: 20
    },
    render(row) {
      let anhXaType = {
        90: 'success',
        50: 'warning',
        0: 'error'
      }

      // Tạo một hàm để ánh xạ giá trị winRate thành loại tương ứng
      function mapWinRateToType(winRate, anhXaType) {
        const keys = Object.keys(anhXaType)
          .map(Number)
          .sort((a, b) => b - a)
        for (const key of keys) {
          if (winRate * 100 >= key) {
            return anhXaType[key]
          }
        }
      }

      return row.winRate || row.winRate === 0
        ? h(
            NButton,
            {
              size: 'small',
              type: mapWinRateToType(row.winRate, anhXaType),
              disabled: !addressTemp.value && !useFetchDataUser9C.avatarAddress,
              // || useConfigURL.selectedPlanet !== 'heimdall',
              secondary: true,
              strong: true,
              onClick: async () => await tryCheckWinRate(row)
            },
            { default: () => `${n(row.winRate, 'percent')}` }
          )
        : h(
            NText,
            { depth: 3 },
            { default: () => t('@--components--leadboardArena-vue.title.empty') }
          )
    }
  },
  {
    title() {
      return t('@--components--leadboardArena-vue.title.actionAttack')
    },
    key: 'actionAttack',
    fixed: 'right',
    width: 100,
    render(row) {
      let anhXaType = {
        20: 'success',
        18: 'warning',
        16: 'error'
      }
      return h(
        NButton,
        {
          size: 'small',
          type: anhXaType[row.winScore],
          disabled:
            row.avatarAddr.toLowerCase() === useFetchDataUser9C.avatarAddress.toLowerCase() ||
            !useFetchDataUser9C.avatarAddress ||
            useHandlerCreatNewAction.isRunning_battleArena,
          // Loading khi đang tấn công
          loading: useHandlerCreatNewAction.isRunning_battleArena,
          onClick: () => tryAttack(row)
        },
        { default: () => 'Attack' }
      )
    }
  }
])

// Hàm làm mới dữ liệu arena
const dataArenaFinal = ref([])
const dataArenaFinalCopy = computed(() => {
  return [...dataArenaFinal.value]
})
const rawArena = computed(() =>
  useFetchDataUser9C.dataUser9C_arena !== null && useFetchDataUser9C.isFetchingDataUser9C === false
    ? useFetchDataUser9C.dataUser9C_arena.arenaParticipants
    : []
)

const addresses = computed(() =>
  JSON.stringify(
    rawArena.value
      .map((item) => item.avatarAddr)
      .filter((addr) => addr)
      .filter(Boolean)
  )
)
const postDataJson_normal = computed(() => {
  return {
    query: `
            query {
              stateQuery {
                arenaInformation(championshipId:${props.champIdSelect},round:${props.roundIdSelect},avatarAddresses:${addresses.value}){
                  avatarAddress
                  win
                  lose
                  ticket
                  ticketResetCount
                  purchasedTicketCount
                }
                # arenaParticipants(
                #   avatarAddress: "0x0000000000000000000000000000000000000000"
                #   filterBounds: false
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
              }
            }
          `
  }
})
const postDataJson_arena = computed(() => {
  return {
    // query: `
    //   query {
    //     stateQuery {
    //       arenaParticipants(
    //         avatarAddress: "0x0000000000000000000000000000000000000000"
    //         filterBounds: false
    //       ) {
    //         avatarAddr
    //         score
    //         rank
    //         winScore
    //         loseScore
    //         cp
    //         portraitId
    //         level
    //         nameWithHash
    //       }
    //     }
    //   }
    // `
    query: `
      query {
        arena {
          rank_100: leaderboard(ranking: 1, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_200: leaderboard(ranking: 101, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_300: leaderboard(ranking: 201, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_400: leaderboard(ranking: 301, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_500: leaderboard(ranking: 401, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_600: leaderboard(ranking: 501, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_700: leaderboard(ranking: 601, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_800: leaderboard(ranking: 701, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_900: leaderboard(ranking: 801, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_1000: leaderboard(ranking: 901, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_1100: leaderboard(ranking: 1001, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_1200: leaderboard(ranking: 1101, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_1300: leaderboard(ranking: 1201, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_1400: leaderboard(ranking: 1301, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_1500: leaderboard(ranking: 1401, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_1600: leaderboard(ranking: 1501, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_1700: leaderboard(ranking: 1601, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_1800: leaderboard(ranking: 1701, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_1900: leaderboard(ranking: 1801, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_2000: leaderboard(ranking: 1901, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_2100: leaderboard(ranking: 2001, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_2200: leaderboard(ranking: 2101, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_2300: leaderboard(ranking: 2201, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_2400: leaderboard(ranking: 2301, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          rank_2500: leaderboard(ranking: 2401, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_2600: leaderboard(ranking: 2501, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_2700: leaderboard(ranking: 2601, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_2800: leaderboard(ranking: 2701, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_2900: leaderboard(ranking: 2801, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_3000: leaderboard(ranking: 2901, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_3100: leaderboard(ranking: 3001, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_3200: leaderboard(ranking: 3101, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_3300: leaderboard(ranking: 3201, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_3400: leaderboard(ranking: 3301, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_3500: leaderboard(ranking: 3401, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_3600: leaderboard(ranking: 3501, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_3700: leaderboard(ranking: 3601, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_3800: leaderboard(ranking: 3701, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_3900: leaderboard(ranking: 3801, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_4000: leaderboard(ranking: 3901, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_4100: leaderboard(ranking: 4001, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_4200: leaderboard(ranking: 4101, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_4300: leaderboard(ranking: 4201, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_4400: leaderboard(ranking: 4301, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_4500: leaderboard(ranking: 4401, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_4600: leaderboard(ranking: 4501, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_4700: leaderboard(ranking: 4601, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_4800: leaderboard(ranking: 4701, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
          #rank_4900: leaderboard(ranking: 4801, length: 100){rank,address,simpleAvatar{agentAddress, name, level},arenaScore{score}}
        }
      }`
  }
})
const urlMerge_normal = computed(() => useConfigURL.selectedNode)
// const urlMerge_arena = computed(() => useConfigURL.selectedNode_arena)
const urlMerge_arena = computed(
  () => `${URL_API_MIMIR}/${useConfigURL.selectedPlanet.toLowerCase()}/graphql`
)
const urlMerge2 = computed(() => API_URL_MERGE_ARENA[useConfigURL.selectedPlanet])
const {
  data: dataArenaWinLose_normal,
  execute: executeUrlMerge_normal,
  abort: abortUrlMerge_normal
} = useFetch(
  urlMerge_normal,
  { immediate: false },
  {
    beforeFetch({ options }) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json'
      }
      return options
    },
    afterFetch(ctx) {
      if (ctx.data.errors !== undefined || ctx.data.data === null) {
        console.log(ctx.data.errors[0].message)
        ctx.data = []
        return ctx
      }
      ctx.data = ctx.data.data.stateQuery.arenaInformation || []
      return ctx
    },
    updateDataOnError: true,
    onFetchError(ctx) {
      console.log('Lỗi gì đó executeUrlMerge ' + ctx.error)
      ctx.data = []
      return ctx
    }
  }
)
  .json()
  .post(postDataJson_normal)

const {
  data: dataArenaWinLose_arena,
  execute: executeUrlMerge_arena,
  abort: abortUrlMerge_arena
} = useFetch(
  urlMerge_arena,
  { timeout: 15000, immediate: false },
  {
    beforeFetch({ options }) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json'
      }
      return options
    },
    afterFetch(ctx) {
      if (ctx.data.errors !== undefined || ctx.data.data === null) {
        console.log(ctx.data.errors[0].message)
        ctx.data = []
        return ctx
      }
      // let leaderboardByAvatarAddress = ctx.data.data.arena.leaderboardByAvatarAddress || []
      let leaderboardByAvatarAddress = []
      for (let key in ctx.data.data.arena) {
        leaderboardByAvatarAddress = leaderboardByAvatarAddress.concat(ctx.data.data.arena[key])
      }
      let arenaParticipants = convertToArenaParticipants(leaderboardByAvatarAddress, 0)
      ctx.data = arenaParticipants || []
      return ctx
    },
    updateDataOnError: true,
    onFetchError(ctx) {
      console.log('Lỗi gì đó executeUrlMerge ' + ctx.error)
      ctx.data = []
      return ctx
    }
  }
)
  .json()
  .post(postDataJson_arena)

const dataArenaWinLose = computed(() => {
  return {
    arenaInformation: dataArenaWinLose_normal.value,
    arenaParticipants: dataArenaWinLose_arena.value
  }
})

const {
  data: dataArenaTicketBought,
  execute: executeUrlMerge2,
  abort: abortUrlMerge2
} = useFetch(
  urlMerge2,
  {
    immediate: false
  },
  {
    updateDataOnError: true,
    onFetchError(ctx) {
      console.log('Lỗi gì đó executeUrlMerge2')
      ctx.data = []
      return ctx
    }
  }
)
  .json()
  .get()
watch(isFetchingDataUser9C, async (newValue) => {
  if (!newValue) {
    useArenaSeason.isMergeListArena = true
    await Promise.all([executeUrlMerge_normal(), executeUrlMerge_arena(), executeUrlMerge2()])
    if (useArenaSeason.isMergeListArena)
      dataArenaFinal.value = await mergeListArena(
        rawArena.value,
        props.champIdSelect,
        props.roundIdSelect,
        useArenaSeason.roundActive,
        useConfigURL.selectedNode,
        useConfigURL.selectedPlanet,
        useFetchDataUser9C.avatarAddress,
        useArenaSeason.maxPurchaseCountDuringIntervalActive,
        dataArenaWinLose.value,
        dataArenaTicketBought.value
      )
    else dataArenaFinal.value = rawArena.value
    useSavingSorterAndFilter()
    useArenaSeason.isMergeListArena = false
  }
})

onBeforeUnmount(() => {
  abortUrlMerge_normal()
  abortUrlMerge_arena()
  abortUrlMerge2()
  abortCheckWinRate()
  useArenaSeason.isMergeListArena = false
})
onMounted(() => {
  refreshArena()
})
</script>
