import { useFetch, useBase64, useStorage } from '@vueuse/core'
import { IMG_FALLBACK } from '@/utilities/constants'
import optimizedStringToHash from '@/utilities/optimizedStringToHash'
// function optimizedStringToHash(string) {
//   let mixedString = string
//   let hash = 0

//   for (let i = 0; i < mixedString.length; i++) {
//     let char = mixedString.charCodeAt(i)
//     hash = (hash << 5) - hash + char
//     hash |= 0 // Convert to 32-bit integer
//   }

//   return hash
// }

const imageBase64FromCacheOrFetch = useStorage('image-base64-or-fetch', {}, sessionStorage)
const saved = imageBase64FromCacheOrFetch.value
const useApi = (url) => {
  return useFetch(url).blob()
}

export function getImageBase64FromCacheOrFetch(imageUrl) {
  // Tính toán hash
  let savedImg = optimizedStringToHash(imageUrl)

  // Kiểm tra và trả về base64 từ lưu trữ nếu có
  if (saved[savedImg] !== null && saved[savedImg] !== undefined) {
    return saved[savedImg]
  }

  // Fetch ảnh từ URL
  const { data: dataImg, error } = useApi(imageUrl)
  // Nếu có lỗi
  if (error.value !== null) {
    return IMG_FALLBACK
  }
  // Chuyển đổi ảnh thành base64
  const { base64: imageBase64 } = useBase64(dataImg)

  // Lưu base64 vào lưu trữ
  saved[savedImg] = imageBase64

  return imageUrl
}
