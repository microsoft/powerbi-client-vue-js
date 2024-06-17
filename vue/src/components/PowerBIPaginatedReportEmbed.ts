// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defineComponent, PropType, toRaw, h } from 'vue';
import { IPaginatedReportLoadConfiguration } from 'powerbi-models';

import PowerBIBase from '../mixins/PowerBIBase';

export default defineComponent({
  name: 'PowerBIPaginatedReportEmbed',

  props: {
    // Configuration for embedding the PowerBI Paginated report (Required)
    embedConfig: {
      type: Object as PropType<IPaginatedReportLoadConfiguration>,
      required: true,
    },
  },

  mixins: [PowerBIBase],

  render() {
    return h('div', { ref: 'containerRef', class: this.cssClassName, id: 'paginatedReportContainer' })
  },

  watch: {
    embedConfig: function (value: IPaginatedReportLoadConfiguration, oldValue: IPaginatedReportLoadConfiguration) {
      // Check if the function is being called for the first time
      if (!oldValue) {
        return;
      }

      // Input from parent get updated, thus call embedPaginatedReport function
      this.embedPaginatedReport();
    },
  },

  computed: {
    config(): IPaginatedReportLoadConfiguration {
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
      this.powerbi.reset(this.$refs.containerRef as HTMLElement);
      this.embed = this.powerbi.embed(this.$refs.containerRef as HTMLElement, this.config);
    },
  },
});