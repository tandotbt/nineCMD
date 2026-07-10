/**
 * Root vitest config – ensures vitest uses src-ts/ alias '@' → src-ts/
 * instead of vite.config.js which maps '@' → src/ (old JS).
 *
 * This file is found by vitest BEFORE vite.config.js, preventing
 * the old JS constants from being loaded during tests.
 */
export { default } from './src-ts/vitest.config'
