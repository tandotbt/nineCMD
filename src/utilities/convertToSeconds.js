export function convertToSeconds(timeString) {
  const timestamp =
    timeString !== null && !isNaN(Date.parse(timeString))
      ? new Date(timeString).getTime() / 1000
      : new Date().getTime() / 1000
  return Math.round(timestamp)
}
export function secondConvertToTime(totalSeconds) {
  // Chuyển đổi thành giờ, phút, giây
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes =
    String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')

  const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, '0')

  return { hours, minutes, seconds }
}