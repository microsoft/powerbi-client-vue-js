# Contributing

## Setup

Clone the repository:
```
git clone <url>
```

Navigate to the cloned directory

Navigate to the *vue* workspace folder:
```
cd vue
```

Install local dependencies:
```
npm install
```

## Build:
```
npm run build
```
Or if using VScode: `Ctrl + Shift + B`

## Test
```
npm test
```
By default the tests run using ChromeHeadless browser

The build and tests use vite to compile all the source modules into bundled module that can be executed in the browser.

## Running the demo

```
npm run demo
```

Open the address to view in the browser:

http://localhost:3000/

## Flow Diagram for the PowerBI Report Component:
![Flow Diagram](/vue/resources/PowerBIReportEmbed_FlowDiagram.png)