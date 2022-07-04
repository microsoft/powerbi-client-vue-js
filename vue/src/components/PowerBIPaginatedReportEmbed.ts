// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defineComponent, PropType, toRaw, h } from 'vue';
import { IEmbedConfiguration } from 'powerbi-client';

import PowerBIBase from '../mixins/PowerBIBase';

export default defineComponent({
  name: 'PowerBIPaginatedReportEmbed',

  props: {
    // Configuration for embedding the PowerBI Paginated report (Required)
    embedConfig: {
      type: Object as PropType<IEmbedConfiguration>,
      required: true,
    },
  },

  mixins: [PowerBIBase],

  render() {
    return h('div', { ref: 'containerRef', class: this.cssClassName, id: 'paginatedReportContainer' })
  },

  watch: {
    embedConfig: function (value: IEmbedConfiguration, oldValue: IEmbedConfiguration) {
      // Check if the function is being called for the first time
      if (!oldValue) {
        return;
      }

      // Input from parent get updated, thus call embedPaginatedReport function
      this.embedPaginatedReport();
    },
  },

  computed: {
    config(): IEmbedConfiguration {
      return toRaw(this.embedConfig);
    }
  },

  mounted(): void {
    // Check if container exists on the UI
    if (this.$refs.containerRef) {
      // Decide to embed
      this.embedPaginatedReport();
    }
  },

  methods: {
    /**
     * Embed the PowerBI Paginated report
     *
     * @returns void
     */
    embedPaginatedReport(): void {
      // Check if the HTML container is rendered and available
      if (!this.$refs.containerRef) {
        console.error("HTML container is not rendered or available");
        return;
      }

      this.embed = this.powerbi.embed(this.$refs.containerRef as HTMLElement, this.config);
    },
  },
});