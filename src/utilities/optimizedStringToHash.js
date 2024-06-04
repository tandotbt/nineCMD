import CryptoJS from 'crypto-js'

export default function optimizedStringToHash(string) {
  // Tạo mã hash từ chuỗi sử dụng thuật toán SHA-256 của crypto-js
  const hash = CryptoJS.SHA256(string).toString()
  // Cắt đoạn mã hash để chỉ lấy 10 ký tự đầu tiên
  const shortHash = hash.substring(0, 10)
  // Trả về mã hash có độ dài cố định là 10 ký tự
  return shortHash
}