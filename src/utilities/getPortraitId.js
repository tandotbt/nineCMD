export function getPortraitId(myAvatarAddress, dataPortraitId, dataFromRest9cscan) {
  if (myAvatarAddress === null) return 10200000
  const item = dataPortraitId.find(item => item.avataraddress.toLowerCase() === myAvatarAddress.toLowerCase())
  if (item !== undefined && item !== null) return item.portraitId


  const itemFromRest9cscan = dataFromRest9cscan.find(item => item.avatarAddress.toLowerCase() === myAvatarAddress.toLowerCase())

  if (itemFromRest9cscan) {
    const itemArmor = itemFromRest9cscan.avatar.inventory.equipments.find(item => item.itemSubType === "ARMOR")
    if (itemArmor) {
      return itemArmor.id
    }
  }

  return 10200000
}