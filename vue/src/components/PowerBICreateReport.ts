// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defineComponent, toRaw, h, PropType} from 'vue';
import { Embed, Create } from 'powerbi-client';
import { IReportCreateConfiguration } from 'powerbi-models';

import PowerBIBase from '../mixins/PowerBIBase';
import { EventHandler } from '../utils/utils';

export default defineComponent({
  name: 'PowerBICreateReport',

  props: {
    // Configuration for creating the PowerBI Report (Required)
    embedConfig: {
      type: Object as PropType<IReportCreateConfiguration>,
      required: true,
    },

    eventHandlers: {
      type: Map as PropType<Map<string, EventHandler>>
    },
  },

  mixins: [PowerBIBase],

  render() {
    return h('div', { ref: 'containerRef', class: this.cssClassName, id: 'createReportContainer' })
  },

  watch: {
    embedConfig: function (value: IReportCreateConfiguration, oldValue: IReportCreateConfiguration) {
      // Check if the function is being called for the first time
      if (!oldValue) {
        return;
      }

      // Input from parent get updated, thus call createEmbedReport function
      this.createEmbedReport();

      // Call event handlers if available
      this.callSetEventHandlers();
    },

    eventHandlers: function() {
      // Call event handlers if available
      this.callSetEventHandlers();
    }
  },

  computed: {
    config(): IReportCreateConfiguration {
      return toRaw(this.embedConfig);
    }
  },

  mounted(): void {
    // Check if container exists on the UI
    if (this.$refs.containerRef) {
      this.createEmbedReport();
    }

    // Call event handlers if available
    this.callSetEventHandlers();
  },

  methods: {
    /**
     * Create the report
     *
     * @returns void
     */
    createEmbedReport(): void {
      // Check if the HTML container is rendered and available
      if (!this.$refs.containerRef) {
        console.error("HTML container is not rendered or available");
        return;
      }
      this.powerbi.reset(this.$refs.containerRef as HTMLElement);
      this.embed = this.powerbi.createReport(this.$refs.containerRef as HTMLElement, this.config);
    },

    callSetEventHandlers(): void {
      // Set event handlers if available
      if (this.eventHandlers && this.embed) {
        this.setEventHandlers(this.embed as Embed, this.eventHandlers);
      }
    },

    getCreateObj(): Create {
      return this.embed as Create;
    }
  },
});