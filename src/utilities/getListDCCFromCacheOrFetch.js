import { useFetch, useStorage } from '@vueuse/core'
import { URL_LIST_DCC } from '@/utilities/constants'

const dataTempNineCMD = useStorage('nine-cmd-data-temp', {}, sessionStorage)
let listDCC
const { execute } = useFetch(
  URL_LIST_DCC,
  { immediate: false },
  {
    beforeFetch({ cancel }) {
      listDCC = dataTempNineCMD.value['listDCC']

      if (listDCC !== null && listDCC != {} && listDCC !== undefined) cancel()

      return
    },
    afterFetch(ctx) {
      ctx.data = ctx.data.avatars || {}
      dataTempNineCMD.value['listDCC'] = ctx.data
      listDCC = ctx.data
      return ctx
    }
  }
)
  .json()
  .get()
export default async function getListDCCFromCacheOrFetch(avatarAddress) {
  await execute()
  const idDCC = avatarAddress in listDCC ? listDCC[avatarAddress] : 0

  return idDCC
}
