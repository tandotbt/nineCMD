import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  // Nhận diện cấu hình mặc định cho các file trong dự án
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,cjs,jsx,vue}'],
  },

  // Loại trừ các thư mục không cần quét (thay thế cho .ignore-path cũ)
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  // Cấu hình chuẩn cho Vue 3 (Essential, Strongly Recommended, hoặc Recommended)
  ...pluginVue.configs['flat/essential'],
  
  // Cấu hình tích hợp với Prettier để tránh xung đột format
  skipFormatting,
]