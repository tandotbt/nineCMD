export function combatPotion({ hP, aTK, dEF, cRI, hIT, sPD, hasSkill }) {
  const buffCP = hasSkill ? 1.15 : 1
  const CP = (hP * 0.7 + aTK * 10.5 + dEF * 10.5 + sPD * 3 + hIT * 2.3 + cRI * 0) * buffCP
  return Math.floor(CP)
}
export function statAndSkillOption({ stat, skills, statsMap }) {
  const statMain = stat.statType.charAt(0).toLowerCase() + stat.statType.slice(1).toUpperCase()
  const whiteStat = stat.totalValue
  const isHasSkill = skills.length !== 0 ? true : false
  let mainStat = {}
  let optionStat = {}
  mainStat[statMain.toUpperCase()] = whiteStat
  const listStat = []
  for (const key in statsMap) {
    if (Object.prototype.hasOwnProperty.call(statsMap, key)) {
      if (statsMap[key] !== 0) {
        listStat.push('stat')
        if (key == statMain) {
          optionStat[key.toUpperCase()] = statsMap[key] - whiteStat
        } else {
          optionStat[key.toUpperCase()] = statsMap[key]
        }
      }

    }
  }
  if (isHasSkill) {
    listStat.push('skill')
  }
  const result = {
    listStat,
    mainStat,
    optionStat,
    isHasSkill
  }

  return result
}

export function statsMapConvert(statsMap_shop) {
  const statsMapConvert = {
    hP: 0,
    aTK: 0,
    dEF: 0,
    cRI: 0,
    hIT: 0,
    sPD: 0
  }
  // Lặp qua tất cả các đối tượng trong danh sách value
  statsMap_shop["value"].forEach(item => {
    const key = item.key
    const value = item.value

    // Chuyển key thành định dạng cần thiết
    const nameKey = key.charAt(0).toLowerCase() + key.slice(1).toUpperCase()

    // Tính giá trị tổng và gán vào đối tượng statsMapConvert
    statsMapConvert[nameKey] = value.additionalValue + value.baseValue
  })
  return statsMapConvert
}
export function statAndSkillOption_shop({ stat_shop, skills, statsMap_shop, optionCountFromCombination }) {
  const isHasSkill = skills.length !== 0 ? true : false
  let mainStat = {}
  let optionStat = {}
  if (Array.isArray(stat_shop)) {
    stat_shop.forEach(item => {
      mainStat[item.statType] = item.baseValue
    })
  } else {
    mainStat[stat_shop.statType] = stat_shop.baseValue
  }
  const listStat = []
  // Lặp qua tất cả các đối tượng trong danh sách value
  statsMap_shop["value"].forEach(item => {
    listStat.push('stat')
    const key = item.key
    const value = item.value
    optionStat[key] = value.additionalValue
  })
  if (isHasSkill) {
    listStat.push('skill')
  }
  // xác định chính xác có bnh sao, nhưng loại và giá trị của sao thứ 2 thì chưa xác định dc
  let i = listStat.length
  while (i < optionCountFromCombination) {
    listStat.unshift('stat')
    // nếu là array thì lấy phần từ 0 tạm
    optionStat[`${Array.isArray(stat_shop) ? stat_shop[0].statType : stat_shop.statType}_${i + 1}`] = 0
    i++
  }
  const result = {
    listStat,
    mainStat,
    optionStat,
    isHasSkill
  }
  return result
}