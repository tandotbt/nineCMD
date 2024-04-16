import { useFetch, useBase64, useStorage } from '@vueuse/core'
import { IMG_FALLBACK } from '@/utilities/constants'
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

import CryptoJS from 'crypto-js'

function optimizedStringToHash(string) {
  // Tạo mã hash từ chuỗi sử dụng thuật toán SHA-256 của crypto-js
  const hash = CryptoJS.SHA256(string).toString()
  // Cắt đoạn mã hash để chỉ lấy 10 ký tự đầu tiên
  const shortHash = hash.substring(0, 10)
  // Trả về mã hash có độ dài cố định là 10 ký tự
  return shortHash
}
const imageBase64FromCacheOrFetch = useStorage('image-base64-or-fetch', {}, sessionStorage)
const useApi = (url) => {
  return useFetch(url).blob()
}

export function getImageBase64FromCacheOrFetch(imageUrl) {
  // Tính toán hash
  let savedImg = optimizedStringToHash(imageUrl)

  // Kiểm tra và trả về base64 từ lưu trữ nếu có
  if (imageBase64FromCacheOrFetch.value[savedImg]) {
    return imageBase64FromCacheOrFetch.value[savedImg]
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
  imageBase64FromCacheOrFetch.value[savedImg] = imageBase64

  return imageUrl
}
