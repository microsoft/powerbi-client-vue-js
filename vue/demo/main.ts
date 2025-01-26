// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createApp } from 'vue'
import { provideFluentDesignSystem, fluentDialog, fluentCard, fluentTextField, fluentButton } from '@fluentui/web-components';
import DemoApp from './App.vue';

provideFluentDesignSystem()
  .register(fluentDialog(), fluentCard(), fluentTextField(), fluentButton());

createApp(DemoApp).mount('#app');