<!-- Copyright (c) Microsoft Corporation. -->
<!-- Licensed under the MIT License. -->

<template>
  <div class="container">
    <div class="header">Power BI Embedded Vue JS Component Demo</div>

    <div class="controls">
      <template v-if="isEmbedded">
        <button @click="changeVisualType()">Change visual type</button>
        <button @click="hideFilterPane()">Hide filter pane</button>
        <button @click="setDataSelectedEvent()">Set event</button>
        <label class="display-message">{{ displayMessage }}</label>
      </template>
      <template v-else>
        <label class="display-message position">{{ displayMessage }}</label>
        <button @click="embedReport()" class="embed-report">Embed Report</button>
      </template>

      <PowerBIReportEmbed v-if="isEmbedded"
        :embed-config="sampleReportConfig"
        :phased-embedding="phasedEmbeddingFlag"
        :css-class-name="reportClass"
        :event-handlers="eventHandlersMap"
        @report-obj="setReportObj">
      </PowerBIReportEmbed>
    </div>

    <div class="footer">
      <p>This demo is powered by Power BI Embedded Analytics</p>
      <label class="separator-pipe">|</label>
      <img title="Power-BI" alt="PowerBI_Icon" class="footer-icon" src="./assets/PowerBI_Icon.png">
      <p>Explore our<a href="https://aka.ms/pbijs/" target="_blank" rel="noreferrer noopener">Playground</a></p>
      <label class="separator-pipe">|</label>
      <img title="GitHub" alt="GitHub_Icon" class="footer-icon" src="./assets/GitHub_Icon.png">
      <p>Find the<a href="https://github.com/microsoft/powerbi-client-vue-js" target="_blank" rel="noreferrer noopener">source code</a></p>
    </div>
  </div>
</template>

<script lang="ts">
import { models, Report, IReportEmbedConfiguration, Page, service, Embed } from 'powerbi-client';
import { IHttpPostMessageResponse } from 'http-post-message';
import 'powerbi-report-authoring';

import { PowerBIReportEmbed } from 'powerbi-client-vue-js';
import { reportUrl } from './public/constant';

// Flag which specifies whether to use phase embedding or not
const phasedEmbeddingFlag = false;

// CSS Class to be passed to the wrapper
const reportClass = 'report-container';

let report: Report;

// Handles the embed config response for embedding
export interface ConfigResponse {
  Id: string;
  EmbedUrl: string;
  EmbedToken: {
    Token: string;
  };
}

export default {
  name: 'DemoApp',

  components: {
    PowerBIReportEmbed,
  },

  data() {
    return {
      // Track Report embedding status
      isEmbedded: false,

      // Overall status message of embedding
      displayMessage: 'The report is bootstrapped. Click Embed Report button to set the access token.',


      // Pass the basic embed configurations to the wrapper to bootstrap the report on first load
      // Values for properties like embedUrl, accessToken and settings will be set on click of button
      sampleReportConfig: {
        type: 'report',
        embedUrl: undefined,
        tokenType: models.TokenType.Embed,
        accessToken: undefined,
        settings: undefined,
      } as IReportEmbedConfiguration,

      /**
       * Map of event handlers to be applied to the embedded report
       * Update event handlers for the report by redefining the map using this.eventHandlersMap
       * Set event handler to null if event needs to be removed
       * More events can be provided from here
       * https://docs.microsoft.com/en-us/javascript/api/overview/powerbi/handle-events#report-events
       */
      eventHandlersMap: new Map([
        ['loaded', () => console.log('Report has loaded')],
        ['rendered', () => console.log('Report has rendered')],
        ['error', (event?: service.ICustomEvent<any>) => {
            if (event) {
              console.error(event.detail);
            }
          },
        ],
        ['visualClicked', () => console.log('visual clicked')],
        ['pageChanged', (event) => console.log(event)],
      ]) as  Map<string, (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null> ,

      // Store Embed object from Report component
      report,
      reportClass,
      phasedEmbeddingFlag
    };
  },

  methods: {
    /**
     * Embeds report
     *
     * @returns Promise<void>
     */
    async embedReport(): Promise<void> {
      console.log('Embed Report clicked');

      // Get the embed config from the service and set the reportConfigResponse
      const reportConfigResponse: Response = await fetch(reportUrl);
      if (!reportConfigResponse?.ok) {
        console.error(`Failed to fetch config for report. Status: ${reportConfigResponse.status} ${reportConfigResponse.statusText}`);
        return;
      }

      const reportConfig: ConfigResponse = await reportConfigResponse.json();

      // Update the reportConfig to embed the PowerBI report
      this.sampleReportConfig = {
        ...this.sampleReportConfig,
        id: reportConfig.Id,
        embedUrl: reportConfig.EmbedUrl,
        accessToken: reportConfig.EmbedToken.Token
      };

      this.isEmbedded = true;

      // Update the display message
      this.displayMessage = 'Use the buttons above to interact with the report using Power BI Client APIs.';
    },

    /**
     * Change visual type
     *
     * @returns Promise<void>
     */
    async changeVisualType(): Promise<void> {
      // Check Report is available or not
      if(!this.reportAvailable()) {
        return;
      }

      // Get all the pages of the report
      const pages: Page[] = await this.report.getPages();

      // Check if the pages are available
      if (pages.length === 0) {
        this.displayMessage = 'No pages found.';
        return;
      }

      // Get active page of the report
      const activePage: Page | undefined = pages.find((page) => page.isActive);

      if (!activePage) {
        this.displayMessage = 'No Active page found';
        return;
      }


      try {
        // Change the visual type using powerbi-report-authoring
        // For more information: https://docs.microsoft.com/en-us/javascript/api/overview/powerbi/report-authoring-overview
        // Get the visual
        const visual = await activePage.getVisualByName('VisualContainer6');

        const response = await visual.changeType('lineChart');

        this.displayMessage = `The ${visual.type} was updated to lineChart.`;
        console.log(this.displayMessage);
        return response;
      } catch (error) {
        if (error === 'PowerBIEntityNotFound') {
          console.log('No Visual found with that name');
        } else {
          console.log(error);
        }
      }
    },

    /**
     * Hide Filter Pane
     *
     * @returns Promise<IHttpPostMessageResponse<void> | undefined>
     */
    async hideFilterPane(): Promise<IHttpPostMessageResponse<void> | undefined> {
      // Check whether Report is available or not
      if(!this.reportAvailable()) {
        return;
      }

      // New settings to hide filter pane
      const settings = {
        panes: {
          filters: {
            expanded: false,
            visible: false,
          },
        },
      };

      try {
        const response: IHttpPostMessageResponse<void> = await this.report.updateSettings(settings);
        this.displayMessage = 'Filter pane is hidden.';
        console.log(this.displayMessage);
        return response;
      } catch (error) {
        console.error(error);
        return;
      }
    },

    /**
     * Set data selected event
     *
     * @returns void
     */
    setDataSelectedEvent(): void {
      this.eventHandlersMap = new Map <string, (event?: service.ICustomEvent<any>) => void> ([
        ...this.eventHandlersMap,
        ['dataSelected', (event) => console.log(event)],
      ]);

      this.displayMessage = 'Data Selected event set successfully. Select data to see event in console.';
    },

    /**
     * Assign Embed Object from Report component to report
     * @param value
     */
    setReportObj(value: Report) {
      this.report = value;
    },

    /**
     * Verify whether report is available or not
     */
    reportAvailable() {
      if (!this.report) {
        // Prepare status message for Error
        this.displayMessage = 'Report not available.';
        console.log(this.displayMessage);
        return false;
      }
      return true;
    }
  },
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  background: #3476ae 0 0 no-repeat padding-box;
  border: 1px solid #707070;
  color: #fff;
  font: 700 22px/27px 'Segoe UI';
  padding: 13px 13px 13px 36px;
  text-align: left;
}

.controls {
  margin-top: 20px;
  text-align: center;
  flex: 1;
}

button {
  background: #337ab7;
  border: 0;
  border-radius: 5px;
  color: #fff;
  font-size: 16px;
  height: 35px;
  margin-right: 15px;
  width: 160px;
}

.display-message {
  align-items: center;
  display: flex;
  font: 400 18px/27px 'Segoe UI';
  height: 30px;
  justify-content: center;
  margin-top: 8px;
  text-align: center;
}

.position {
  margin-top: 40vh;
}

.embed-report {
  margin-top: 18px;
  text-align: center;
  margin-right: 0;
}

.footer {
  align-items: center;
  background: #f7f8fa 0 0 no-repeat padding-box;
  display: flex;
  font: 400 16px/21px 'Segoe UI';
  height: 42px;
  justify-content: center;
  width: 100%;
}

.footer * {
  padding: 0 3px;
}

.footer-icon {
  border-radius: 50%;
  height: 22px;
  vertical-align: middle;
}

.footer a {
  color: #3a3a3a;
  text-decoration: underline;
}

body {
  font-family: 'Segoe UI';
  margin: 0;
}

iframe {
  border: none;
}

.report-container {
  height: 75vh;
  margin: 8px auto;
  width: 90%;
}
</style>