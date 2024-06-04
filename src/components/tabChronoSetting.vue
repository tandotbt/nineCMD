<template>
  <n-input v-model:value="agent"></n-input>
  <n-input v-model:value="plainValue"></n-input>
  <n-switch v-model:value="active" />
  <n-p>Connected Chrono: {{ isConnected }}</n-p>
  <n-p>Connect: {{ useExtensionService.allData.Chrono.connect }}</n-p>
  <n-button @click="tryConnect()">Connect</n-button>
  <n-p>Public key: {{ useExtensionService.allData.Chrono.publicKey }}</n-p>
  <n-button @click="tryGetPublicKey()"> getPublicKey </n-button>
  <n-p> signTransaction: {{ useExtensionService.allData.Chrono.signTransaction }}</n-p>
  <n-button @click="tryGetSignTransaction()"> getSignTransaction </n-button>
</template>

<script setup>
import { ref } from 'vue'
import { computedAsync } from '@vueuse/core'
import { useExtensionServiceStore } from '@/stores/extensionService'
const useExtensionService = useExtensionServiceStore()

const agent = ref('0x6374fe5f54cded72ff334d09980270c61bc95186')
const plainValue = ref('')
const active = ref(false)
// const tryConnect = async () => {
//   await window.chronoWallet.connect()
//   // Chọn planet cho chrono
//   await window.chronoWallet.switchNetwork(useConfigURL.planetId)
//   listAddresss.value = await window.chronoWallet.listAccounts()
// }

const isConnected = computedAsync(
  async () => {
    return await window.chronoWallet.isConnected()
  },
  null // initial state
)

function tryConnect() {
  useExtensionService.executeTryConnectChrono(0, {})
}
function tryGetPublicKey() {
  useExtensionService.executeGetPublicKeyChrono(0, { agent: agent.value })
}
function tryGetSignTransaction() {
  useExtensionService.executeGetSignTransactionChrono(0, {
    agent: agent.value,
    plainValue: plainValue.value
  })
}
</script>

<style scoped></style>
