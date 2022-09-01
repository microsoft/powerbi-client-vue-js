# powerbi-client-vue-js
Power BI Vue component. This library lets you embed Power BI reports, dashboards, tiles, report visuals, Q&As and paginated reports in your Vue application.

## Quick Start

### Import
*Import the 'PowerBIReportEmbed' inside your target module:*
```ts
import { PowerBIReportEmbed } from 'powerbi-client-vue-js';
```

### Embed a Power BI report
```ts
<PowerBIReportEmbed
    :embedConfig = {{
        type: "report",
        id: "<Report Id>",
        embedUrl: "<Embed Url>",
        accessToken: "<Access Token>",
        tokenType: models.TokenType.Embed,
        settings: {
            panes: {
                filters: {
                    expanded: false,
                    visible: false
                }
            },
            background: models.BackgroundType.Transparent,
        }
    }}

    :cssClassName = { "reportClass" }

    :phasedEmbedding = { false }

    :eventHandlers = {
        new Map([
            ['loaded', () => console.log('Report loaded');],
            ['rendered', () => console.log('Report rendered');],
            ['error', (event) => console.log(event.detail);]
        ])
    }
>
</PowerBIReportEmbed>
```

### How to [bootstrap a PowerBI report](https://docs.microsoft.com/javascript/api/overview/powerbi/bootstrap-better-performance):
```ts
<PowerBIReportEmbed
    :embedConfig = {{
        type: "report",
        id: undefined,
        embedUrl: undefined,
        accessToken: undefined, // Keep as empty string, null or undefined
        tokenType: models.TokenType.Embed,
        hostname: "https://app.powerbi.com"
    }}
>
</PowerBIReportEmbed>
```

__Note__: To embed the report after [bootstrapping](https://docs.microsoft.com/javascript/api/overview/powerbi/bootstrap-better-performance), update the embedConfig (with at least accessToken and embedUrl).

## Embedding other Power BI artifacts
The library offers the following components that can be used to embed various Power BI artifacts.

|Component|Selector to use for embedding|
|:------|:------|
|PowerBIReportEmbedComponent|```<PowerBIReportEmbed>```|
|PowerBIDashboardEmbedComponent|```<PowerBIDashboardEmbed>```|
|PowerBITileEmbedComponent|```<PowerBITileEmbed>```|
|PowerBIVisualEmbedComponent|```<PowerBIVisualEmbed>```|
|PowerBIQnaEmbedComponent|```<PowerBIQnaEmbed>```|
|PowerBIPaginatedReportEmbedComponent|```<PowerBIPaginatedReportEmbed>```|
<br>

You can embed other artifacts such as:
```ts
<PowerBIDashboardEmbed
    :embedConfig = "<IDashboardEmbedConfiguration>"
    :cssClassName = "<className>"
    :eventHandlers = "<Map of String and eventHandler>"
>
</PowerBIDashboardEmbed>
```
### Demo

This demo includes a Vue application that embeds a sample report using the _PowerBIReportEmbed_ component.<br/>
It demonstrates the complete flow from bootstrapping the report, to embedding and updating the embedded report.<br/>
It also demonstrates using the *powerbi report authoring* library, by enabling the user to change the type of visual from a report using the "Change visual type" button.<br />
It also sets a 'DataSelected' event.

<br />
To run the demo on localhost, run the following command:

```
npm run demo
```

Redirect to http://localhost:3000/ to view in the browser.

### Usage
|Use case|Details|
|:------|:------|
|Embed Power BI|To embed your powerbi artifact, pass the component with at least type, embedUrl and accessToken in embedConfig property.|
|Apply style class|Pass the name(s) of style classes to be applied to the embed container div to the cssClassName property.|
|Set event handlers|Pass a map object of event name (string) and event handler (function) to the _eventHandlers_ prop. <br/>__Key__: Event name <br/>__Value__: Event handler method to be triggered<br/>Event handler method takes two optional parameters:<br/>*First parameter*: Event<br/>*Second parameter*: Reference to the embedded entity <br /><br /> List of supported events is given here: [Additional events](#supported-events)|
|Reset event handlers|To reset event handler for an event, set the event handler's value as null in the eventHandlers map of properties.|
|Bootstrap Power BI|To [bootstrap your powerbi entity](https://docs.microsoft.com/javascript/api/overview/powerbi/bootstrap-better-performance), pass the property *embedConfig* to the component without _accessToken_<br/>__Note__: _embedConfig_ should at least contain __type__ of the powerbi entity being embedded. <br/>Available types: "report", "dashboard", "tile", "visual" and "qna".<br/>Refer to _How to bootstrap a report_ section in [Quick Start](#quick-start). <br /><br />__Note__:  A paginated report cannot be bootstrapped.|
|Using with PowerBI Report Authoring|1. Install [powerbi-report-authoring](https://www.npmjs.com/package/powerbi-report-authoring) as an npm dependency.<br>2. Use the report authoring APIs using the embedded report's instance.|
|Phased embedding (Report type only)|Set the phasedEmbedding property value to `true` <br/> Refer to the [Phased embedding article](https://docs.microsoft.com/javascript/api/overview/powerbi/phased-embedding).|

<br />

__Note__: Supported browsers are _Edge_, _Chrome_,  and _Firefox_.
<br />

### Properties accepted by Components

|Property|Description|Supported by|
|:-------|:----------|:----------|
|embedConfig|Configuration for embedding the PowerBI entity (required)|All|
|phasedEmbedding|Phased embedding flag (optional)|Report|
|eventHandlers|Map of pair of event name and its handler method to be triggered on the event (optional)|Report, Dashboard, Tile, Visual, Qna|
|cssClassName|CSS class to be set on the embedding container (optional)|All|
|service|Provide the instance of PowerBI service (optional)|All|

<br />

## Supported Events


### Events supported by various Power BI entities:

|Entity|Event|
|:----- |:----- |
| Report | "buttonClicked", "commandTriggered", "dataHyperlinkClicked", "dataSelected", "loaded", "pageChanged", "rendered", "saveAsTriggered", "saved", "selectionChanged", "visualClicked", "visualRendered" |
| Dashboard | "loaded", "tileClicked" |
| Tile | "tileLoaded", "tileClicked" |
| QnA | "visualRendered" |

<br />

### Event Handler to be used with Map
```ts
type EventHandler = (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null;
```

## Using supported SDK methods for Power BI artifacts
### Import
*Import the 'PowerBIReportEmbed' inside your targeted component file:*
```ts
import { PowerBIReportEmbed } from 'powerbi-client-vue-js';
```

### Initialize inside the Component
Component will emit report-obj and You can use this variable.Add method in the component template.
```ts
<PowerBIReportEmbed v-if="isEmbedded"
    :embed-config="sampleReportConfig"
    :phased-embedding="phasedEmbeddingFlag"
    :css-class-name="reportClass"
    :event-handlers="eventHandlersMap"
    @report-obj="setReportObj">
</PowerBIReportEmbed>
```
Declare a variable ```report!:Report``` and set the report to the report-obj.
```ts
setReportObj(value: Report) {
    this.report = value;
},
```

### Use
You can use ```report``` to call supported SDK APIs.
```ts
async getReportPages(): Page[] {
    const pages = await this.report.getPages();
    console.log(pages);
}
```

### Note
The library supports Vue applications having version **>= 3**.

### Dependencies

powerbi-client (https://www.npmjs.com/package/powerbi-client)

### Peer Dependencies
vue (https://www.npmjs.com/package/vue)

### Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow [Microsoft’s Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general). Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those third-party’s policies.

### Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us the rights to use your contribution. For details, visit <https://cla.opensource.microsoft.com>.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions provided by the bot. You will only need to do this once across all repositories using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments

### Data Collection.

The software may collect information about you and your use of the software and send it to Microsoft. Microsoft may use this information to provide services and improve our products and services. You may turn off the telemetry as described in the repository. There are also some features in the software that may enable you and Microsoft to collect data from users of your applications.

If you use these features, you must comply with applicable law, including providing appropriate notices to users of your applications together with a copy of Microsoft’s privacy statement.
Our privacy statement is located at [Microsoft Privacy Statement](https://privacy.microsoft.com/en-us/privacystatement). You can learn more about data collection and use in the help documentation and our privacy statement. Your use of the software operates as your consent to these practices.

### Support
Our public support page is available at [Microsoft Support Statement](https://powerbi.microsoft.com/en-us/support/).
