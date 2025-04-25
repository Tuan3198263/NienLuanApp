// Xóa nội dung phức tạp và chỉ sử dụng cấu hình mặc định
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
module.exports = config;
