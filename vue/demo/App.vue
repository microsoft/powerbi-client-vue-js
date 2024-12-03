<!-- Copyright (c) Microsoft Corporation. -->
<!-- Licensed under the MIT License. -->

<template>
  <div class="container">
    <div class="header">Power BI Embedded Vue JS Component Demo</div>
    <div class="controls">
      <template v-if="isEmbedded">
        <div class="button-container">
          <button @click="toggleFilterPane()">{{ filterPaneBtnText }}</button>
          <button @click="toggleTheme()">{{ themeBtnText }}</button>
          <button @click="setDataSelectedEvent()">{{ dataSelectedBtnText }}</button>
          <button @click="toggleZoom()">{{ zoomBtnText }}</button>
          <button @click="refreshReport()">Refresh report</button>
          <button @click="enableFullScreen()">Full screen</button>
        </div>
        <label class="display-message">{{ displayMessage }}</label>
      </template>
      <template v-else>
        <label class="display-message position">{{ displayMessage }}</label>
        <button @click="openEmbedConfigDialog()" class="embed-report">Embed Report</button>
      </template>

      <EmbedConfigDialog :isEmbedConfigDialogVisible="isEmbedConfigDialogVisible" @embedConfigEvent="embedReport" @update:isEmbedConfigDialogVisible="isEmbedConfigDialogVisible = $event" />
      <EventDetailsDialog :isEventDetailsDialogVisible="isEventDetailsDialogVisible" :dataSelectedEventDetails="dataSelectedEventDetails" @update:isEventDetailsDialogVisible="isEventDetailsDialogVisible = $event"/>

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
import { defineComponent } from 'vue';
import { models, Report, IReportEmbedConfiguration, service, Embed } from 'powerbi-client';
import { IHttpPostMessageResponse } from 'http-post-message';
import 'powerbi-report-authoring';

import { PowerBIReportEmbed } from 'powerbi-client-vue-js';
import { sampleTheme } from './constants/constants';
import EmbedConfigDialog from './components/EmbedConfigDialog.vue';
import EventDetailsDialog from './components/EventDetailsDialog.vue';

// Flag which specifies whether to use phase embedding or not
const phasedEmbeddingFlag = false;

// CSS Class to be passed to the wrapper
const reportClass = 'report-container';

// Constants for zoom levels
const zoomOutLevel = 0.5;
const zoomInLevel = 0.9;

let report: Report;

// Handles the embed config response for embedding
export interface ConfigResponse {
  embedUrl: string;
  aadToken: string
}

export default defineComponent ({
  name: 'DemoApp',

  components: {
    PowerBIReportEmbed,
    EmbedConfigDialog,
    EventDetailsDialog
  },

  data() {
    return {
      // Track Report embedding status
      isEmbedded: false,

      // Overall status message of embedding
      displayMessage: 'The report is bootstrapped. Click the Embed Report button to set the access token.',

      // Flag for button toggles
      isFilterPaneVisibleAndExpanded: true,
      isThemeApplied: false,
      isZoomedOut: false,
      isDataSelectedEvent: false,

      // Button text
      filterPaneBtnText: "Hide filter pane",
      themeBtnText: "Set theme",
      zoomBtnText: "Zoom out",
      dataSelectedBtnText: "Show dataSelected event in dialog",

      // Pass the basic embed configurations to the wrapper to bootstrap the report on first load
      // Values for properties like embedUrl, accessToken and settings will be set on click of button
      sampleReportConfig: {
        type: 'report',
        embedUrl: undefined,
        tokenType: models.TokenType.Aad,
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
        ['loaded', () => {
            this.setTitle();
            console.log('Report has loaded');
          }
        ],
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
      phasedEmbeddingFlag,
      isEmbedConfigDialogVisible: false,

      // Flag to display the data selected event details dialog
      isEventDetailsDialogVisible: false,
      dataSelectedEventDetails: undefined
    };
  },

  methods: {
    /**
     * Show the dailog for Embed Config input
     */
    openEmbedConfigDialog(): void {
      this.isEmbedConfigDialogVisible = true;
    },

    /**
     * Embeds report
     */
    embedReport(reportConfig: ConfigResponse): void {
      // Update the reportConfig to embed the PowerBI report
      this.sampleReportConfig = {
        ...this.sampleReportConfig,
        embedUrl: reportConfig.embedUrl,
        accessToken: reportConfig.aadToken,
      };

      this.isEmbedded = true;

      // Update the display message
      this.displayMessage = 'Use the buttons above to interact with the report using Power BI Client APIs.';
    },

    /**
     * Toggle Filter Pane
     *
     * @returns Promise<IHttpPostMessageResponse<void> | undefined>
     */
    async toggleFilterPane(): Promise<IHttpPostMessageResponse<void> | undefined> {
      if(!this.reportAvailable()) {
        return;
      }

      this.isFilterPaneVisibleAndExpanded = !this.isFilterPaneVisibleAndExpanded;

      // New settings to show/hide the filter pane
      const settings = {
        panes: {
          filters: {
            expanded: this.isFilterPaneVisibleAndExpanded,
            visible: this.isFilterPaneVisibleAndExpanded,
          },
        },
      };

      try {
        const response: IHttpPostMessageResponse<void> = await this.report.updateSettings(settings);
        this.displayMessage = this.isFilterPaneVisibleAndExpanded ? "Filter pane is visible" : "Filter pane is hidden";
        this.filterPaneBtnText = this.isFilterPaneVisibleAndExpanded ? "Hide filter pane" : "Show filter pane";
        console.log(this.displayMessage);
        return response;
      } catch (error) {
        console.error(error);
        return;
      }
    },

    /**
     * Set data selected event
     */
    setDataSelectedEvent(): void {
      this.isDataSelectedEvent = !this.isDataSelectedEvent;

      if(this.isDataSelectedEvent) {
        this.eventHandlersMap = new Map <string, (event?: service.ICustomEvent<any>) => void> ([
          ...this.eventHandlersMap,
          ['dataSelected', (event) => {
            event?.detail.dataPoints.length && this.dataSelectedEventDetailsDialog(event.detail);
          }],
        ]);

        this.displayMessage = "Data Selected event has been successfully set. Click on a data point to see the details.";
        this.dataSelectedBtnText = "Hide dataSelected event in dialog";
      }
      else {
        this.eventHandlersMap.delete('dataSelected');
        this.report?.off('dataSelected');
        this.displayMessage = "Data Selected event has been successfully unset.";
        this.dataSelectedBtnText = "Show dataSelected event in dialog";
      }
    },

    dataSelectedEventDetailsDialog(dataSelectedEventDetails: any): void {
      this.dataSelectedEventDetails = dataSelectedEventDetails;
      this.isEventDetailsDialogVisible = true;
    },

    closeDataSelectedEventDetailsDialog(): void {
      this.isEventDetailsDialogVisible = false;
    },

    setTitle(): void {
      if (!this.reportAvailable()) {
        return;
      }

      this.report.setComponentTitle('Embedded Report');
    },

    /**
     * Assign Embed Object from Report component to report
     * @param value
     */
    setReportObj(value: Report): void {
      this.report = value;
    },

    /**
     * Verify whether report is available or not
     */
    reportAvailable(): boolean {
      if (!this.report) {
        // Prepare status message for Error
        this.displayMessage = 'Report not available.';
        console.log(this.displayMessage);
        return false;
      }
      return true;
    },

    /**
     * Toggle theme
     *
     * @returns Promise<void>
     */
    async toggleTheme(): Promise<void> {
      if (!this.reportAvailable()) {
        return;
      }

      // Update the theme by passing in the custom theme.
      // Some theme properties might not be applied if your report has custom colors set.
      try {
        if (this.isThemeApplied) {
          await this.report.resetTheme();
        }
        else {
          await this.report.applyTheme({ themeJson: sampleTheme });
        }

        this.isThemeApplied = !this.isThemeApplied;

        this.displayMessage = this.isThemeApplied ? "Theme has been applied" : "Theme has been reset to default";
        this.themeBtnText = this.isThemeApplied ? "Reset theme" : "Set theme";
        console.log(this.displayMessage);
      }
      catch (error) {
        this.displayMessage = "Failed to apply theme.";
        console.log(error);
      }
    },

    /**
     * Toggle zoom
     *
     * @returns Promise<void>
    */
    async toggleZoom(): Promise<void> {
      if (!this.reportAvailable()) {
        return;
      }

      try {
        const newZoomLevel = this.isZoomedOut ? zoomInLevel : zoomOutLevel;
        await this.report.setZoom(newZoomLevel);
        this.isZoomedOut = !this.isZoomedOut;
        this.zoomBtnText = this.isZoomedOut ? "Zoom in" : "Zoom out";
      }
      catch (errors) {
        console.log(errors);
      }
    },

    /**
     * Refresh report event
     *
     * @returns Promise<void>
    */
    async refreshReport(): Promise<void> {
      if (!this.reportAvailable()) {
        return;
      }

      try {
        await this.report.refresh();
        this.displayMessage = 'The report has been refreshed successfully.';
      }
      catch (error: any) {
        this.displayMessage = error.detailedMessage;
        console.log(error);
      }
    },

    /**
     * Full screen event
    */
    enableFullScreen(): void {
      if (!this.reportAvailable()) {
        return;
      }

      this.report.fullscreen();
    },
  },
});
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  background: #117865 0 0 no-repeat padding-box;
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
  background: #117865;
  border: none;
  border-radius: 5px;
  color: #fff;
  cursor: pointer;
  font-size: 1em;
  height: 35px;
  margin-bottom: 8px;
  margin-right: 15px;
  min-width: 270px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: calc((100% / 3) - 120px);
}

.button-container {
  margin-left: auto;
  margin-right: auto;
  max-width: 1120px;
}

.display-message {
  align-items: center;
  display: flex;
  font: 400 18px/27px 'Segoe UI';
  height: 30px;
  justify-content: center;
  text-align: center;
}

.position {
  margin-top: 40vh;
}

.embed-report {
  margin-right: 0;
  margin-top: 18px;
  text-align: center;
  width: 184px;
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

@media screen and (max-width: 980px) {
  p {
      font-size: 12px;
  }
}

@media screen and (max-width: 767px) {
  p {
      font-size: 10px;
  }

  .display-message {
    font: 400 14px 'Segoe UI';
  }

  .footer {
    font: 400 8px 'Segoe UI';
    height: 64px;
  }
}
</style>