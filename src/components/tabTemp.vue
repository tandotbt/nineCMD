<template>
  <n-input v-model:value="address"></n-input>
  <n-input v-model:value="nineCMD"></n-input>
  <n-input v-model:value="unsignTx"></n-input>
  <n-switch v-model:value="active" />
  <n-p>Public key: {{ statePublicKey }} | {{ isReadyPublicKey }} | {{ isLoadingPublicKey }}</n-p>
  <n-p>List addresss: {{ listAddresss }}</n-p>
  <n-button @click="tryConnect">Connect</n-button>
  <n-button @click="executeGetPublicKey(0, {})">getPublicKey</n-button>
  <n-button @click="getUnsignTx">getUnsignTx</n-button>
  <n-button @click="getPlayload">getPlayload</n-button>

  <n-p>isConnect: {{ isConnected }}</n-p>
  <n-p>unsignTx: {{ unsignTx }}</n-p>
  <n-p>payload: {{ payload }}</n-p>
</template>

<script setup>
import { ref } from 'vue'
import { computedAsync } from '@vueuse/core'
import { useConfigURLStore } from '@/stores/configURL'
import buffer2Hex from '@/utilities/buffer2Hex'
const useConfigURL = useConfigURLStore()

const address = ref('0x6374fe5f54cded72ff334d09980270c61bc95186')
const nineCMD = ref('')
const unsignTx = ref('')
const listAddresss = ref()

const payload = ref('')
const active = ref(false)
const tryConnect = async () => {
  await window.chronoWallet.connect()
  // Chọn planet cho chrono
  await window.chronoWallet.switchNetwork(useConfigURL.planetId)
  listAddresss.value = await window.chronoWallet.listAccounts()
}

const isConnected = computedAsync(
  async () => {
    return await window.chronoWallet.isConnected()
  },
  null // initial state
)
import { useAsyncState } from '@vueuse/core'
const {
  state: statePublicKey,
  isReady: isReadyPublicKey,
  isLoading: isLoadingPublicKey,
  execute: executeGetPublicKey
} = useAsyncState(
  // eslint-disable-next-line no-unused-vars
  async (args) => {
    try {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (active.value) {
            clearInterval(interval)
            resolve()
          }
        }, 100)
      })
      let a = await window.chronoWallet.getPublicKey(address.value)
      return a.toHex('compressed')
    } catch (error) {
      return error
    }
  }
)

function getUnsignTx() {
  let temp = window.chronoWallet.sign(address.value, nineCMD.value)
  console.log(temp)
  unsignTx.value = buffer2Hex(temp)
}
async function getPlayload() {
  let temp = await window.chronoWallet.sign(address.value, unsignTx.value)
  console.log(temp)
  payload.value = buffer2Hex(temp)
}
</script>

<style scoped></style>
