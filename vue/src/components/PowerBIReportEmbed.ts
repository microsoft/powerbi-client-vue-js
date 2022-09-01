// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defineComponent, PropType, toRaw, h} from 'vue';
import { IReportEmbedConfiguration, Embed, Report } from 'powerbi-client';

import PowerBIBase from '../mixins/PowerBIBase';
import { EventHandler } from '../utils/utils';

export default defineComponent({
  name: 'PowerBIReportEmbed',
  emits: ['report-obj'],

  props: {
    // Configuration for embedding the PowerBI Report (Required)
    embedConfig: {
      type: Object as PropType<IReportEmbedConfiguration>,
      required: true,
    },

    // Phased embedding flag (Optional)
    phasedEmbedding: {
      type: Boolean,
      default: false,
    },

    // Map of event name and handler methods pairs to be triggered on the event (Optional)
    eventHandlers: {
      type: Map as PropType<Map<string, EventHandler>>
    },
  },

  mixins: [PowerBIBase],

  render() {
    return h('div', { ref: 'containerRef', class: this.cssClassName, id: 'reportContainer' })
  },

  watch: {
    embedConfig: function (value: IReportEmbedConfiguration, oldValue: IReportEmbedConfiguration) {
      // Check if the function is being called for the first time
      if (!oldValue) {
        return;
      }

      // Input from parent get updated, thus call embedOrBootstrap function
      this.embedOrBootstrap();

      // Call event handlers if available
      this.callSetEventHandlers();
    },

    eventHandlers: function() {
      // Call event handlers if available
      this.callSetEventHandlers();
    }
  },

  computed: {
    config(): IReportEmbedConfiguration {
      return toRaw(this.embedConfig);
    }
  },

  mounted(): void {
    // Check if container exists on the UI
    if (this.$refs.containerRef) {
      // Decide to embed, load or bootstrap
      this.embedOrBootstrap();
    }

    // Call event handlers if available
    this.callSetEventHandlers();
  },

  methods: {
    /**
     * Function to decide to embed, load or bootstrap
     *
     * @returns void
     */
    embedOrBootstrap(): void {
      // Decide to embed, load or bootstrap
      if (this.config?.accessToken && this.config?.embedUrl) {
        this.embedReport();
      } else {
        this.embed = this.powerbi.bootstrap(this.$refs.containerRef as HTMLElement, this.config);
      }
    },

    /**
     * Embed or load the PowerBI Report based on phasedEmbedding flag
     *
     * @returns void
     */
    embedReport(): void {
      // Check if the HTML container is rendered and available
      if (!this.$refs.containerRef) {
        console.error("HTML container is not rendered or available");
        return;
      }

      // Load when phasedEmbedding flag is true, embed otherwise
      this.embed = this.phasedEmbedding ? this.powerbi.load(this.$refs.containerRef as HTMLElement, this.config) : this.powerbi.embed(this.$refs.containerRef as HTMLElement, this.config);

      // Emit to use getReport in App
      this.$emit("report-obj", this.getReport());
    },

    /**
     * Set event handlers if available
     *
     * @returns void
     */
    callSetEventHandlers(): void {
      // Set event handlers if available
      if (this.eventHandlers && this.embed) {
        this.setEventHandlers(this.embed as Embed, this.eventHandlers);
      }
    },

    // Returns embed object to calling function
    getReport(): Report {
      return this.embed as Report;
    },
  },
});