import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // Loại trừ các thư mục không cần quét
  { ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'] },

  // Cấu hình TypeScript (cho .ts/.tsx)
  ...tseslint.configs.recommended,

  // Cấu hình Vue 3 Essential (cho .vue)
  ...pluginVue.configs['flat/essential'],

  // Vue files: dùng @typescript-eslint/parser bên trong vue-eslint-parser
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // Cấu hình tích hợp với Prettier
  skipFormatting,

  // Tắt rules gây xung đột với Vue/TS patterns
  {
    name: 'app/overrides',
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-setup-props-reactivity-loss': 'off',
    },
  },
)
