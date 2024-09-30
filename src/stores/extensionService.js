import { defineStore } from 'pinia'

import { ref, computed, reactive, watch } from 'vue'
import { useFetchDataUser9CStore } from './fetchDataUser9C'
import { useConfigURLStore } from './configURL'
import { useAsyncState } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import buffer2Hex from '@/utilities/buffer2Hex'
import { useMessage } from "naive-ui"
export const useExtensionServiceStore = defineStore('extensionServiceStore', () => {
  const { t } = useI18n()
  const message = useMessage()
  const useFetchDataUser9C = useFetchDataUser9CStore()
  const useConfigURL = useConfigURLStore()


  // Biến lưu tất cả dữ liệu
  const allData = reactive({
    Chrono: {
      connect: {
        state: computed(() => stateConnectChrono.value),
        isReady: computed(() => isReadyConnectChrono.value),
        isLoading: computed(() => isLoadingConnectChrono.value),
        isConnected: computed(() => isConnectedChrono.value)

      },
      publicKey: {
        state: computed(() => statePublicKeyChrono.value),
        isReady: computed(() => isReadyPublicKeyChrono.value),
        isLoading: computed(() => isLoadingPublicKeyChrono.value),
      },
      signTransaction: {
        state: computed(() => stateSignTransactionChrono.value),
        isReady: computed(() => isReadySignTransactionChrono.value),
        isLoading: computed(() => isLoadingSignTransactionChrono.value),
      },
    }
  })

  // Kiểm tra xem đã có nhập ví đang login vào chrono chưa
  const isConnectedChrono = ref(false)
  const userAgent = computed(() => useFetchDataUser9C.userAgent.toLowerCase())
  // Hàm gỡ trạng thái connected khi đổi agent
  watch(userAgent, () => {
    isConnectedChrono.value = false
    selectServiceSign.value = "NineCMDSign"
  })

  const {
    state: stateConnectChrono,
    isReady: isReadyConnectChrono,
    isLoading: isLoadingConnectChrono,
    execute: executeTryConnectChrono
  } = useAsyncState(
    async () => {
      try {
        if (window.chronoWallet === undefined) throw t("@--components--tabSettingNinecmd-vue.other.messageNeedInstallChronoFirst")
        // Chọn planet cho chrono
        await window.chronoWallet.switchNetwork(useConfigURL.planetId)
        await window.chronoWallet.connect()
        const listAccounts = await window.chronoWallet.listAccounts()
        // Kiểm tra xem đã nhập ví vào Chrono chưa
        isConnectedChrono.value = listAccounts[0].address ? listAccounts.some(item => item.address.toLowerCase() === userAgent.value) : false
        // Tự chọn Chrono làm dịch vụ ký
        if (isConnectedChrono.value) selectServiceSign.value = 'Chrono'
        else selectServiceSign.value = 'NineCMDSign'
        return listAccounts
      } catch (error) {
        console.error(error)
        message.warning(error.toString())
        return [{ address: "" }]
      }
    }, [{ address: "" }], { immediate: false, resetOnExecute: false }
  )
  // Lấy public key
  const {
    state: statePublicKeyChrono,
    isReady: isReadyPublicKeyChrono,
    isLoading: isLoadingPublicKeyChrono,
    execute: executeGetPublicKeyChrono
  } = useAsyncState(
    async (args) => {
      try {
        if (window.chronoWallet === undefined) throw t("@--components--tabSettingNinecmd-vue.other.messageNeedInstallChronoFirst")
        let a = await window.chronoWallet.getPublicKey(args.agent)
        return a.toHex('compressed')
      } catch (error) {
        console.error(error)
        message.warning(error.toString())
        return error
      }
    }, "", { immediate: false }
  )


  // Lấy signTransaction
  const {
    state: stateSignTransactionChrono,
    isReady: isReadySignTransactionChrono,
    isLoading: isLoadingSignTransactionChrono,
    execute: executeGetSignTransactionChrono
  } = useAsyncState(
    async (args) => {
      try {
        if (window.chronoWallet === undefined) throw t("@--components--tabSettingNinecmd-vue.other.messageNeedInstallChronoFirst")
        // Chọn planet cho chrono
        await window.chronoWallet.switchNetwork(useConfigURL.planetId)
        let a = await window.chronoWallet.sign(args.agent, args.plainValue)
        return buffer2Hex(a)
      } catch (error) {
        console.error(error)
        message.warning(error.toString())
        return error
      }
    }, "", { immediate: false }
  )

  const selectServiceSign = ref('NineCMDSign')
  const listServiceExtensions = computed(() => [
    {
      label: t('@--views--LoginMain-vue.thing.NineCMDSign.header'),
      value: "NineCMDSign",
      disabled: false
    }, {
      label: t('@--views--LoginMain-vue.thing.Chrono.header'),
      value: "Chrono",
      disabled: !isConnectedChrono.value
    }
  ])
  // executeGetPublicKeyChrono(delay, {agent: "0x123"})
  return {
    allData,
    executeTryConnectChrono, executeGetPublicKeyChrono, executeGetSignTransactionChrono,
    selectServiceSign, listServiceExtensions
  }
})
