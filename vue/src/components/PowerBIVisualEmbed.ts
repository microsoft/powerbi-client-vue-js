// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defineComponent, PropType, toRaw, h } from 'vue';
import { IVisualEmbedConfiguration, Embed, Visual } from 'powerbi-client';

import PowerBIBase from '../mixins/PowerBIBase';
import { EventHandler } from '../utils/utils';

export default defineComponent({
  name: 'PowerBIVisualEmbed',

  props: {
    // Configuration for embedding the PowerBI Visual (Required)
    embedConfig: {
      type: Object as PropType<IVisualEmbedConfiguration>,
      required: true,
    },

    // Map of event name and handler methods pairs to be triggered on the event (Optional)
    eventHandlers: {
      type: Map as PropType<Map<string, EventHandler>>,
    },
  },

  mixins: [PowerBIBase],

  render() {
    return h('div', { ref: 'containerRef', class: this.cssClassName, id: 'visualContainer' })
  },

  watch: {
    embedConfig: function (value: IVisualEmbedConfiguration, oldValue: IVisualEmbedConfiguration) {
      // Check if the function is being called for the first time
      if (!oldValue) {
        return;
      }

      // Input from parent get updated, thus call embedOrUpdateVisual function
      this.embedOrBootstrap();

      // Call event handlers if available
      this.callSetEventHandlers();
    },

    eventHandlers: function() {
      // call event handlers if available
      this.callSetEventHandlers();
    },
  },

  computed: {
    config(): IVisualEmbedConfiguration {
      return toRaw(this.embedConfig);
    }
  },

  mounted(): void {
    // Check if container exists on the UI
    if (this.$refs.containerRef) {
      // Decide to embed or bootstrap
      this.embedOrBootstrap();
    }

    // Call event handlers if available
    this.callSetEventHandlers();
  },

  methods: {
    /**
     * Function to decide to embed or bootstrap
     *
     * @returns void
     */
    embedOrBootstrap(): void {
       if (this.config?.accessToken && this.config?.embedUrl) {
        this.embedVisual();
      } else {
        this.embed = this.powerbi.bootstrap(this.$refs.containerRef as HTMLElement, this.config);
      }
    },

    /**
     * Embed the PowerBI Visual
     *
     * @returns void
     */
    embedVisual(): void {
      // Check if the HTML container is rendered and available
      if (!this.$refs.containerRef) {
        console.error("HTML container is not rendered or available");
        return;
      }

      this.embed = this.powerbi.embed(this.$refs.containerRef as HTMLElement, this.config);
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
    getVisual(): Visual {
      return this.embed as Visual;
    }
  },
});