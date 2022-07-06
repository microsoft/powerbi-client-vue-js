// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defineComponent } from 'vue';
import { factories, service, Embed, Report, Dashboard, Tile, Qna, Visual } from 'powerbi-client';

import { EventHandler, areMapsSame, SdkType, SdkWrapperVersion } from '../utils/utils';

export enum EmbedType {
  Report = 'report',
  Dashboard = 'dashboard',
  Tile = 'tile',
  Qna = 'qna',
  Visual = 'visual'
}

/**
 * Base component to hold common properties for all the Power BI entities
 */
export default defineComponent({
  name: 'PowerBIBase',

  props: {
    // CSS class to be set on the embedding container (Optional)
    cssClassName: {
      type: String
    },

    // Provide a custom implementation of Power BI service (Optional)
    service: {
      type: service.Service,
    }
  },

  data() {
    // Initialize powerbi variable for child component
    const powerbi: service.Service = this.service ? this.service : new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);
    powerbi.setSdkInfo(SdkType, SdkWrapperVersion);

    const prevEventHandlerMap: Map<string, EventHandler> = new Map([]);
    let embed!: Embed;
    return {
      powerbi,
      prevEventHandlerMap,
      embed
    }
  },

  methods: {
    /**
     * Sets all event handlers from the input on the embedded entity
     *
     * @param embed Embedded object
     * @param eventHandlerMap Array of event handlers to be set on the embedded entity
     * @returns void
     */
    setEventHandlers(embed: Embed, eventHandlerMap: Map<string, EventHandler>): void {
      // Check if event handler map changed
      if (areMapsSame(this.prevEventHandlerMap, eventHandlerMap)) {
        return;
      }

      // Update prev event handler map with new event handler map
      this.prevEventHandlerMap = eventHandlerMap;

      // List of allowed events
      let allowedEvents = Embed.allowedEvents;
      const entityType = embed.embedtype;

      // Append entity specific events
      switch (entityType) {
        case EmbedType.Report:
          allowedEvents = [...allowedEvents, ...Report.allowedEvents]
          break;
        case EmbedType.Dashboard:
          allowedEvents = [...allowedEvents, ...Dashboard.allowedEvents]
          break;
        case EmbedType.Tile:
          allowedEvents = [...allowedEvents, ...Tile.allowedEvents]
          break;
        case EmbedType.Qna:
          allowedEvents = [...allowedEvents, ...Qna.allowedEvents]
          break;
        case EmbedType.Visual:
          allowedEvents = [...allowedEvents, ...Visual.allowedEvents]
          break;
        default:
          console.error(`Invalid embed type ${entityType}`);
      }

      // Holds list of events which are not allowed
      const invalidEvents: Array<string> = [];

      // Apply all provided event handlers
      eventHandlerMap.forEach((eventHandlerMethod, eventName) => {
        // Check if this event is allowed
        if (allowedEvents.includes(eventName)) {
          // Removes event handler for this event
          embed.off(eventName);

          // Event handler is effectively removed for this event when eventHandlerMethod is null
          if (eventHandlerMethod) {
            // Set single event handler
            embed.on(eventName, (event: service.ICustomEvent<any>): void => {
              eventHandlerMethod(event, embed);
            });
          }
        }
        else {
          // Add this event name to the list of invalid events
          invalidEvents.push(eventName);
        }
      });

      // Handle invalid events
      if (invalidEvents.length) {
        console.error(`Following events are invalid: ${invalidEvents.join(',')}`);
      }
    }
  }
});