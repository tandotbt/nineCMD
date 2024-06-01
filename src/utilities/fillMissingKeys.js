export default function fillMissingKeys(object, exempleData) {
  // Tạo mảng các key mà bạn muốn điền nếu chưa tồn tại trong đối tượng
  const keysToFill = [];

  // Duyệt qua mỗi thuộc tính (property) của đối tượng trong mảng dữ liệu mẫu
  Object.keys(exempleData).forEach(key => {
    // Kiểm tra xem key đã tồn tại trong đối tượng không
    if (!Object.prototype.hasOwnProperty.call(object, key)) {
      keysToFill.push(key); // Thêm key vào mảng keysToFill
    }
  });

  // Duyệt qua mỗi key trong mảng keysToFill để điền giá trị cho các key còn thiếu
  keysToFill.forEach(key => {
    object[key] = exempleData[key]
  });

  return object;

}
