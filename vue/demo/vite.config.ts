// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const customElements = ['fluent-button', 'fluent-card', 'fluent-icon', 'fluent-text-field', 'fluent-dialog']

export default defineConfig({
  plugins: [vue({
    template: {
      compilerOptions: {
        isCustomElement: tag => customElements.indexOf(tag) !== -1
      }
    }
  })]
})