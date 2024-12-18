import { defineStore } from 'pinia'
import { useFetch } from '@vueuse/core'
import { computed, ref, reactive, watch } from 'vue'
import { URL_API_MIMIR } from '@/utilities/constants.js'
import { useConfigURLStore } from '@/stores/configURL'
import { useFetchDataUser9CStore } from '@/stores/fetchDataUser9C'
export const useFetchDataShopMimirAvatarStore = defineStore('fetchDataShopMimirAvatarStore', () => {
  const useConfigURL = useConfigURLStore()
  const useFetchDataUser9C = useFetchDataUser9CStore()
  const avatarAddressSeller = ref(null)
  const url_mimir = computed(
    () => `${URL_API_MIMIR}/${useConfigURL.selectedPlanet.toLowerCase()}/graphql`
  )
  const postDataShopMimirAvatar = computed(() => {
    return {
      query: `query {productIds(avatarAddress: "${avatarAddressSeller.value}")}`
    }
  })

  const {
    data: dataShopMimirAvatar,
    isFetching: isFetchingShopMimirAvatar,
    execute: executeShopMimirAvatar,
    abort: abortShopMimirAvatar
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

        ctx.data = ctx.data.data.productIds || []
        return ctx
      },
      updateDataOnError: true,
      onFetchError(ctx) {
        console.log('Lỗi gì đó với shopMimirAvatar ' + ctx.error)
        ctx.data = []
        return ctx
      }
    }
  )
    .json()
    .post(postDataShopMimirAvatar)

  // Hàm tạo chuỗi theo định dạng yêu cầu
  function generateQuery(productId) {
    // Thay thế dấu "-" bằng "_"
    const modifiedUUID = productId.replace(/-/g, '_');

    // Tạo chuỗi theo định dạng yêu cầu
    return `a_${modifiedUUID}: product(productId: "${productId}") { ...data }`;
  }

  const postDataShopMimirAvatar_temp = computed(() => {
    const listProductId = dataShopMimirAvatar.value || []
    return listProductId.map(generateQuery)

  })
  const chuck_postDataShopMimirAvatar_temp = ref([])
  const postDataShopMimirAvatar_products = computed(() => {
    return {
      query: `query { ${chuck_postDataShopMimirAvatar_temp.value.join('\n ')} } fragment data on ProductInterface { productId productType registeredBlockIndex sellerAgentAddress sellerAvatarAddress ... on FavProduct { productId productType registeredBlockIndex sellerAgentAddress sellerAvatarAddress asset { decimalPlaces quantity rawValue ticker } price { decimalPlaces quantity rawValue ticker } __typename } ... on ItemProduct { itemCount productId productType registeredBlockIndex sellerAgentAddress sellerAvatarAddress price { decimalPlaces quantity rawValue ticker } tradableItem { elementalType grade id itemSubType itemType ... on Armor { elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } skills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } stat { additionalValue baseValue statType } statsMap { value { key value { additionalValue baseValue statType } } } } ... on Aura { elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } skills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } stat { additionalValue baseValue statType } statsMap { value { key value { additionalValue baseValue statType } } } } ... on Belt { elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } skills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } stat { additionalValue baseValue statType } statsMap { value { key value { additionalValue baseValue statType } } } } ... on Consumable { elementalType grade id itemId itemSubType itemType requiredBlockIndex buffSkills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } skills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } stats { additionalValue baseValue statType } statsMap { value { key value { additionalValue baseValue statType } } } } ... on Costume { elementalType equipped grade id itemId itemSubType itemType requiredBlockIndex spineResourcePath } ... on Equipment { elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } skills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } stat { additionalValue baseValue statType } statsMap { value { key value { additionalValue baseValue statType } } } } ... on Grimoire { elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } skills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } stat { additionalValue baseValue statType } statsMap { value { key value { additionalValue baseValue statType } } } } ... on ItemBase { elementalType grade id itemSubType itemType } ... on ItemUsable { elementalType grade id itemId itemSubType itemType requiredBlockIndex buffSkills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } skills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } statsMap { value { key value { additionalValue baseValue statType } } } } ... on Material { elementalType grade id itemSubType itemType } ... on Necklace { elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } skills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } stat { additionalValue baseValue statType } statsMap { value { key value { additionalValue baseValue statType } } } } ... on Ring { elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } skills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } stat { additionalValue baseValue statType } statsMap { value { key value { additionalValue baseValue statType } } } } ... on TradableMaterial { elementalType grade id itemSubType itemType requiredBlockIndex } ... on Weapon { elementalType equipped exp grade id itemId itemSubType itemType level madeWithMimisbrunnrRecipe optionCountFromCombination requiredBlockIndex setId spineResourcePath buffSkills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } skills { chance power referencedStatType statPowerRatio skillRow { combo cooldown elementalType hitCount id skillCategory skillTargetType skillType } } stat { additionalValue baseValue statType } statsMap { value { key value { additionalValue baseValue statType } } } } __typename } } ... on Product { productId productType registeredBlockIndex sellerAgentAddress sellerAvatarAddress price { decimalPlaces quantity rawValue ticker } } price { decimalPlaces quantity rawValue ticker } __typename } `
    }
  })

  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  const {
    data: dataShopMimirAvatar_productId,
    isFetching: isFetchingShopMimirAvatar_productId,
    execute: executeShopMimirAvatar_productId,
    abort: abortShopMimirAvatar_productId
  } = useFetch(
    url_mimir,
    { timeout: 15000, immediate: false },
    {
      beforeFetch({ options }) {
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json'
        };
        return options;
      },
      afterFetch(ctx) {
        if (ctx.data.errors !== undefined || ctx.data.data === null) {
          console.log(ctx.data.errors[0].message);
          ctx.data = [];
          return ctx;
        }
        ctx.data = ctx.data.data || {}
        return ctx;
      },
      updateDataOnError: true,
      onFetchError(ctx) {
        console.log('Lỗi gì đó với shopMimirAvatar ' + ctx.error);
        ctx.data = [];
        return ctx;
      }
    }
  )
    .json()
    .post(postDataShopMimirAvatar_products);
  // Hàm này sẽ chia mảng thành các nhóm nhỏ và fetch từng nhóm
  async function fetchChunkedData(postData) {
    // Chia mảng `postData` thành các nhóm con, mỗi nhóm tối đa 10 đối tượng
    const chunkedData = chunkArray(postData, 10);

    let allData = []; // Mảng chứa tất cả dữ liệu đã fetch

    // Lặp qua từng nhóm và fetch dữ liệu
    for (const chunk of chunkedData) {
      // Cập nhật giá trị cho chunk hiện tại
      chuck_postDataShopMimirAvatar_temp.value = chunk;

      // Thực hiện fetch
      await executeShopMimirAvatar_productId();

      // Kiểm tra xem dữ liệu đã được fetch xong chưa
      if (!isFetchingShopMimirAvatar_productId.value) {
        // Ghép kết quả trả về vào mảng chung
        allData = { ...allData, ...dataShopMimirAvatar_productId.value };
      }
    }

    // Trả về tất cả dữ liệu đã fetch
    return Object.values(allData);
  }
  const dataShopMimirAvatar_final = ref([])
  watch(
    postDataShopMimirAvatar_temp,
    // eslint-disable-next-line no-unused-vars
    async (newVal, oldVal) => {
      // Hủy bỏ các yêu cầu cũ nếu có
      abortShopMimirAvatar_productId();

      // Gọi hàm fetchChunkedData để lấy dữ liệu
      const allData = await fetchChunkedData(newVal);
      dataShopMimirAvatar_final.value = allData
    },
    { immediate: true }
  );


  const isFetchingALL = computed(() => isFetchingShopMimirAvatar.value || isFetchingShopMimirAvatar.value || isFetchingShopMimirAvatar_productId.value)

  let funcListShopMimirAvatarALl = useFetchDataUser9C.funcFillMoreInfo['shopMimirAvatar']
  const shopDataMimirAll = reactive({
    dataShopMimirAvatar: computed(() => funcListShopMimirAvatarALl(dataShopMimirAvatar_final.value)),
  })


  return {
    avatarAddressSeller,
    postDataShopMimirAvatar,
    isFetchingALL,
    dataShopMimirAvatar, executeShopMimirAvatar, abortShopMimirAvatar,
    postDataShopMimirAvatar_products,
    dataShopMimirAvatar_productId, executeShopMimirAvatar_productId, abortShopMimirAvatar_productId,
    shopDataMimirAll,
  }
})
