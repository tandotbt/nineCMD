// Hàm chuyển mảng thành đối tượng có key
export function arrayToIndexedObject(arr, keyPropertyNames) {
  return arr.reduce((acc, curr) => {
    const key = keyPropertyNames.map(col => curr[col]).join('-')
    if (key !== undefined) {
      acc[key] = curr;
    }
    return acc;
  }, {});
}
