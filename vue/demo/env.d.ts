// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}