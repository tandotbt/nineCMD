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