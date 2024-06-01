import { useFetch, useStorage } from '@vueuse/core'
import { API_URL_PROXY, URL_API_GUILD } from '@/utilities/constants'

const newData = (data) => {
  return data.flatMap(({ name, avatarModels }) =>
    avatarModels.map(({ agentAddress, avatarAddress }) => ({
      nameGuild: name,
      agentAddress,
      avatarAddress
    }))
  )
}

const dataTempNineCMD = useStorage('nine-cmd-data-temp', {}, sessionStorage)
let listGuild
let listGuildLabel
const { execute } = useFetch(
  API_URL_PROXY +
  encodeURIComponent(
    `${URL_API_GUILD}/api/guild`
  ),
  { immediate: false },
  {
    beforeFetch({ cancel }) {
      listGuild = dataTempNineCMD.value['listGuild']
      listGuildLabel = dataTempNineCMD.value['listGuildLabel']

      if (listGuild !== null && listGuild != [] && listGuild !== undefined && listGuildLabel !== null && listGuildLabel != [] && listGuildLabel !== undefined) cancel()

      return
    },
    afterFetch(ctx) {
      ctx.data = ctx.data || []
      let dataTemp = ctx.data
      listGuildLabel = dataTemp.map(item => ({
        label: item.name.split('_').pop(),
        value: item.name,
        img: item.name
      }))
      listGuildLabel.sort((a, b) => a.label.localeCompare(b.label))
      ctx.data = newData(ctx.data) || []
      dataTempNineCMD.value['listGuild'] = ctx.data
      dataTempNineCMD.value['listGuildLabel'] = listGuildLabel
      listGuild = ctx.data
      return ctx
    }
  }
)
  .json()
  .get()
execute()
export default function getListGuildFromCacheOrFetch(avatarAddress) {

  const nameGuild = listGuild.find(member => member.avatarAddress.toLowerCase() == avatarAddress.toLowerCase())
  return nameGuild !== undefined ? nameGuild.nameGuild : ""
}
