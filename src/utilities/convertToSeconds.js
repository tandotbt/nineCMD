export default function convertToSeconds(timeString) {
  const timestamp =
    timeString !== null && !isNaN(Date.parse(timeString))
      ? new Date(timeString).getTime() / 1000
      : new Date().getTime() / 1000
  return Math.round(timestamp)
}
