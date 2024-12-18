import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'
import { computed, ref, reactive } from 'vue'
import { URL_API_MIMIR } from '@/utilities/constants.js'
import { useConfigURLStore } from '@/stores/configURL'
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'
export const useFetchDataShopMimirStore = defineStore('fetchDataShopMimirStore', () => {
  const useConfigURL = useConfigURLStore()
  const useFetchDataUser9C = useFetchDataUser9CStore()
  const pageIndex = ref(0)
  const pageLength = ref(3)
  const pageStart = computed(() => pageIndex.value * pageLength.value)

  const hasNextPage = ref(true)
  const hasPreviousPage = ref(false)
  const url_mimir = computed(
    () => `${URL_API_MIMIR}/${useConfigURL.selectedPlanet.toLowerCase()}/graphql`
  )
  const postDataShopMimir = computed(() => {
    return {
      query: `query{products(skip:${pageStart.value} take:${pageLength.value} filter:{itemSubType:null itemType:null productType:null sortBy:null sortDirection:null}){pageInfo{hasNextPage hasPreviousPage}items{unitPrice object{productId productType registeredBlockIndex sellerAgentAddress sellerAvatarAddress...on FavProduct{productId productType registeredBlockIndex sellerAgentAddress sellerAvatarAddress asset{decimalPlaces quantity rawValue ticker}price{decimalPlaces quantity rawValue ticker}__typename}...on ItemProduct{itemCount productId productType registeredBlockIndex sellerAgentAddress sellerAvatarAddress price{decimalPlaces quantity rawValue ticker}tradableItem{elementalType grade id itemSubType itemType...on Armor{elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}skills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}stat{additionalValue baseValue statType}statsMap{value{key value{additionalValue baseValue statType}}}}...on Aura{elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}skills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}stat{additionalValue baseValue statType}statsMap{value{key value{additionalValue baseValue statType}}}}...on Belt{elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}skills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}stat{additionalValue baseValue statType}statsMap{value{key value{additionalValue baseValue statType}}}}...on Consumable{elementalType grade id itemId itemSubType itemType requiredBlockIndex buffSkills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}skills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}stats{additionalValue baseValue statType}statsMap{value{key value{additionalValue baseValue statType}}}}...on Costume{elementalType equipped grade id itemId itemSubType itemType requiredBlockIndex spineResourcePath}...on Equipment{elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}skills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}stat{additionalValue baseValue statType}statsMap{value{key value{additionalValue baseValue statType}}}}...on Grimoire{elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}skills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}stat{additionalValue baseValue statType}statsMap{value{key value{additionalValue baseValue statType}}}}...on ItemBase{elementalType grade id itemSubType itemType}...on ItemUsable{elementalType grade id itemId itemSubType itemType requiredBlockIndex buffSkills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}skills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}statsMap{value{key value{additionalValue baseValue statType}}}}...on Material{elementalType grade id itemSubType itemType}...on Necklace{elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}skills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}stat{additionalValue baseValue statType}statsMap{value{key value{additionalValue baseValue statType}}}}...on Ring{elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}skills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}stat{additionalValue baseValue statType}statsMap{value{key value{additionalValue baseValue statType}}}}...on TradableMaterial{elementalType grade id itemSubType itemType requiredBlockIndex}...on Weapon{elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}skills{chance power referencedStatType statPowerRatio skillRow{combo cooldown elementalType hitCount id skillCategory skillTargetType skillType}}stat{additionalValue baseValue statType}statsMap{value{key value{additionalValue baseValue statType}}}}__typename}}...on Product{productId productType registeredBlockIndex sellerAgentAddress sellerAvatarAddress price{decimalPlaces quantity rawValue ticker}}price{decimalPlaces quantity rawValue ticker}__typename}avatarAddress combatPoint crystal crystalPerPrice id productsStateAddress}}}`
    }
  })

  const {
    data: dataShopMimir,
    isFetching: isFetchingShopMimir,
    execute: executeShopMimir,
    abort: abortShopMimir
  } = useFetch(
    url_mimir,
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
        hasNextPage.value = ctx.data.data.products.pageInfo.hasNextPage
        hasPreviousPage.value = ctx.data.data.products.pageInfo.hasPreviousPage
        ctx.data = ctx.data.data.products.items || []
        return ctx
      },
      updateDataOnError: true,
      onFetchError(ctx) {
        console.log('Lỗi gì đó với shopMimir ' + ctx.error)
        ctx.data = []
        return ctx
      }
    }
  )
    .json()
    .post(postDataShopMimir)
  let funcListShopMimirALl = useFetchDataUser9C.funcFillMoreInfo['shopMimirAll']
  const shopDataMimirAll = reactive({
    dataShopMimir: computed(() => funcListShopMimirALl(dataShopMimir.value)),
  })

  function nextPage() {
    if (hasNextPage.value) {
      pageIndex.value += 1
      executeShopMimir()
    }
  }
  function previousPage() {
    if (hasPreviousPage.value && pageIndex.value >= 1) {
      pageIndex.value -= 1
      executeShopMimir()
    }
  }
  return {
    pageIndex, pageLength, pageStart, hasNextPage, hasPreviousPage,
    postDataShopMimir,
    dataShopMimir, isFetchingShopMimir, executeShopMimir, abortShopMimir,
    shopDataMimirAll,
    nextPage, previousPage
  }
})
