import { useFetch } from '@vueuse/core'
import { API_NINECMD } from '@/utilities/constants'


export async function getEquipmentsAndRuneFrom9cscan(selectedPlanet, type, agentAddress, avatarAddress) {

  const { data: dataEandC, execute: executeEandC } = useFetch(
    `${API_NINECMD}/lookupItemSetMuti?network=${selectedPlanet}&avatarAddress=${avatarAddress}&type=${type}&agentAddress=${agentAddress}&use9cscan=true`,
    { immediate: false },
    {
      afterFetch(ctx) {
        const { error, message } = ctx.data;
        ctx.data = {
          "costumes": error ? [] : message.costumes,
          "equipments": error ? [] : message.equipments,
          "runeInfos": []
        };
        if (error) console.log(message);
        return ctx;
      }

    }
  )
    .json()
    .get()
  const { data: dataR, execute: executeR } = useFetch(
    `${API_NINECMD}/lookupRuneSetMuti?network=${selectedPlanet}&avatarAddress=${avatarAddress}&type=${type}&agentAddress=${agentAddress}&use9cscan=true`,
    { immediate: false },
    {
      afterFetch(ctx) {
        ctx.data = ctx.data.error === 0 ? ctx.data.message : [];
        if (ctx.data.error) {
          console.log(ctx.data.message);
        }
        return ctx;
      }
    }
  )
    .json()
    .get()
  await executeEandC()
  await executeR()
  dataEandC.value.runeInfos = dataR.value
  return dataEandC
}
