// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { defineConfig } = require('vite');
const vue = require('@vitejs/plugin-vue');
const path = require('path');

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/public-api.ts'),
      name: 'PowerbiClientVue',
      // the proper extensions will be added
      fileName: (format) => `powerbi-client-vue-js.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'powerbi-client'],
      output: {
        // Provide global variables to use in the UMD build
        // Add external deps here
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  plugins: [vue()]
})