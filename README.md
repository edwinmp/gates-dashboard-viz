# DI Chart Boilerplate

A starting point for creating a chart (D3, Plotly, ECharts)

## Specifics for Gates OECD ##

You will need to change all '2020' only in utils/constants.js to the new year during update. You will also need to adjust parts of the wagtail but these should be clear.

## Usage

### Dev

        npm start

This starts the dev environment, compiling the javascript and css. Changes to JS & CSS files trigger a page refresh in the browser

### Build

        npm run build

Build files are copied into the `dist` folder. It is from these files that the contents of the assets folder are updated

To update the assets, copy the contents of the relevant files from the dist folder (`app.*.js`, `app.*.css`, `runtime.*.js`) into their 
respective destinations in the assets folder

### Copy Bundled Assets

        gulp

This copies the required assets from the generated dist folder to the assets folder
